import { z } from 'zod';
import type { ReservationStatus as DbReservationStatus } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const transitionReservationMutation = procedures.adminLocal
	.input(
		z.object({
			reservationId: z.string().trim().min(1),
			next: z.enum(['pending', 'confirmed', 'rejected', 'completed']),
			storeId: z.string().trim().min(1),
			reason: z.string().trim().optional(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const { reservationId, next, storeId, reason } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const reservation = await prisma.reservation.findUnique({
			where: { id: reservationId },
		});
		if (!reservation || reservation.storeId !== storeId) {
			throw new Error('Reserva no encontrada');
		}

		if (next === 'rejected' && (!reason || reason.length < 10)) {
			throw new Error('Debe proporcionar un motivo válido para rechazar');
		}

		// Map DB enum -> client status and allowed transitions
		const mapStatus = (
			s: string,
		): 'pending' | 'confirmed' | 'completed' | 'rejected' => {
			if (s === 'PENDING') return 'pending';
			if (s === 'CONFIRMED') return 'confirmed';
			if (s === 'COMPLETED') return 'completed';
			return 'rejected';
		};

		const allowed: Record<string, string[]> = {
			pending: ['confirmed', 'rejected'],
			confirmed: ['completed', 'rejected'],
			rejected: [],
			completed: [],
		};

		const current = mapStatus(reservation.status);
		if (!allowed[current].includes(next)) {
			throw new Error('Transición no permitida');
		}

		const now = new Date();
		const nextDbStatus = next.toUpperCase();
		const data: {
			status: DbReservationStatus;
			confirmedAt?: Date;
			completedAt?: Date;
			canceledAt?: Date;
			statusReason?: string | null;
		} = { status: nextDbStatus as DbReservationStatus };

		if (next === 'confirmed') data.confirmedAt = now;
		if (next === 'completed') data.completedAt = now;
		if (next === 'rejected') {
			data.canceledAt = now;
			data.statusReason = reason;
		}

		const updated = await prisma.reservation.update({
			where: { id: reservationId },
			data,
			include: {
				product: { select: { name: true } },
				customerUser: { select: { email: true } },
			},
		});

		return {
			reservation: {
				id: updated.id,
				storeId: updated.storeId,
				productId: updated.productId,
				productName: updated.product.name,
				quantity: updated.quantity,
				customerName: updated.pickupFullName,
				customerEmail: updated.customerUser.email,
				pickupPhone: updated.pickupPhone,
				startsAt: updated.requestedAt.toISOString(),
				endsAt: updated.requestedAt.toISOString(),
				status: mapStatus(updated.status),
				notes: updated.pickupNote ?? null,
				requestedAt: updated.requestedAt.toISOString(),
				confirmedAt: updated.confirmedAt?.toISOString() ?? null,
				completedAt: updated.completedAt?.toISOString() ?? null,
				canceledAt: updated.canceledAt?.toISOString() ?? null,
				statusReason: updated.statusReason ?? null,
				createdAt: updated.createdAt.toISOString(),
			},
		};
	});
