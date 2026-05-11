import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const listStoreReservationsQuery = procedures.adminLocal
	.input(
		z.object({
			storeId: z.string().trim().min(1),
			status: z.array(z.string()).optional(),
			dateFrom: z.string().optional(),
			dateTo: z.string().optional(),
		}),
	)
	.query(async ({ input, ctx }) => {
		const { storeId, status, dateFrom, dateTo } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const where: Prisma.ReservationWhereInput = { storeId };

		if (status && status.length > 0) {
			// Map client status to DB enum
			const dbStatuses = status
				.map((s) => {
					if (s === 'pending') return 'PENDING';
					if (s === 'confirmed') return 'CONFIRMED';
					if (s === 'completed') return 'COMPLETED';
					if (s === 'rejected') return 'REJECTED';
					if (s === 'canceled') return 'CANCELED'; // Include canceled as rejected
					return null;
				})
				.filter(Boolean) as string[];

			if (dbStatuses.length > 0) {
				// If rejected is requested, also include canceled
				if (
					dbStatuses.includes('REJECTED') &&
					!dbStatuses.includes('CANCELED')
				) {
					dbStatuses.push('CANCELED');
				}
				where.status = {
					in: dbStatuses as Prisma.EnumReservationStatusFilter['in'],
				};
			}
		}

		if (dateFrom || dateTo) {
			where.requestedAt = {};
			if (dateFrom) where.requestedAt.gte = new Date(dateFrom);
			if (dateTo) {
				const to = new Date(dateTo);
				to.setHours(23, 59, 59, 999);
				where.requestedAt.lte = to;
			}
		}

		const reservations = await prisma.reservation.findMany({
			where,
			include: {
				product: { select: { name: true } },
				customerUser: { select: { email: true } },
			},
			orderBy: { requestedAt: 'desc' },
			take: 200,
		});

		const mapStatus = (
			s: string,
		): 'pending' | 'confirmed' | 'completed' | 'rejected' => {
			if (s === 'PENDING') return 'pending';
			if (s === 'CONFIRMED') return 'confirmed';
			if (s === 'COMPLETED') return 'completed';
			// REJECTED or CANCELED -> rejected
			return 'rejected';
		};

		return {
			reservations: reservations.map((r) => ({
				id: r.id,
				storeId: r.storeId,
				productId: r.productId,
				productName: r.product.name,
				quantity: r.quantity,
				customerName: r.pickupFullName,
				customerEmail: r.customerUser.email,
				pickupPhone: r.pickupPhone,
				startsAt: r.requestedAt.toISOString(),
				endsAt: r.requestedAt.toISOString(),
				status: mapStatus(r.status),
				notes: r.pickupNote ?? null,
				requestedAt: r.requestedAt.toISOString(),
				confirmedAt: r.confirmedAt?.toISOString() ?? null,
				completedAt: r.completedAt?.toISOString() ?? null,
				canceledAt: r.canceledAt?.toISOString() ?? null,
				statusReason: r.statusReason ?? null,
				createdAt: r.createdAt.toISOString(),
			})),
		};
	});
