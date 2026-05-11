import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const listStorePromotionsQuery = procedures.adminLocal
	.input(z.object({ storeId: z.string().trim().min(1) }))
	.query(async ({ input, ctx }) => {
		const { storeId } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const promotions = await prisma.promotion.findMany({
			where: { storeId },
			orderBy: { startsAt: 'desc' },
		});

		const mapStatus = (
			s: string,
		): 'draft' | 'active' | 'inactive' | 'expired' => {
			if (s === 'ACTIVE') return 'active';
			if (s === 'INACTIVE') return 'inactive';
			if (s === 'EXPIRED') return 'expired';
			return 'draft';
		};

		return {
			promotions: promotions.map((p) => ({
				id: p.id,
				storeId: p.storeId,
				title: p.title,
				description: p.description,
				discountPercent: p.discountPercent,
				startsAt: p.startsAt?.toISOString() ?? null,
				endsAt: p.endsAt?.toISOString() ?? null,
				status: mapStatus(p.status),
				viewsCount: p.viewsCount,
				clicksCount: p.clicksCount,
				createdAt: p.createdAt.toISOString(),
			})),
		};
	});
