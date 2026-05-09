import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const createStorePromotionMutation = procedures.adminLocal
	.input(
		z.object({
			storeId: z.string().trim().min(1),
			title: z.string().trim().min(2),
			description: z.string().optional(),
			discountPercent: z.number().min(0).max(100),
			startsAt: z.string(),
			endsAt: z.string(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const { storeId, title, description, discountPercent, startsAt, endsAt } =
			input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const promotion = await prisma.promotion.create({
			data: {
				mallId: store.mallId,
				storeId,
				title,
				description,
				discountPercent,
				startsAt: new Date(startsAt),
				endsAt: new Date(endsAt),
				status: 'ACTIVE',
				createdByUserId: ctx.user.id,
			},
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
			promotion: {
				id: promotion.id,
				storeId: promotion.storeId,
				title: promotion.title,
				description: promotion.description,
				discountPercent: promotion.discountPercent,
				startsAt: promotion.startsAt?.toISOString() ?? null,
				endsAt: promotion.endsAt?.toISOString() ?? null,
				status: mapStatus(promotion.status),
				viewsCount: promotion.viewsCount,
				clicksCount: promotion.clicksCount,
				createdAt: promotion.createdAt.toISOString(),
			},
		};
	});
