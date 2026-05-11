import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getPendingReservationsCountQuery = procedures.adminLocal
	.input(z.object({ storeId: z.string().trim().min(1) }))
	.query(async ({ input, ctx }) => {
		const { storeId } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const count = await prisma.reservation.count({
			where: { storeId, status: 'PENDING' },
		});

		const lastReservation = await prisma.reservation.findFirst({
			where: { storeId, status: 'PENDING' },
			orderBy: { requestedAt: 'desc' },
			select: { requestedAt: true },
		});

		return {
			count,
			lastRequestedAt: lastReservation?.requestedAt.toISOString() ?? null,
		};
	});
