import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const listAllPublicProductsQuery = procedures.public
	.input(
		z.object({
			limit: z.number().int().min(1).max(200).default(100),
		}),
	)
	.query(async ({ input }) => {
		const products = await prisma.product.findMany({
			where: {
				status: 'ACTIVE',
				store: { status: 'ACTIVE', mall: { status: 'ACTIVE' } },
			},
			select: {
				id: true,
				name: true,
				category: true,
				priceOriginal: true,
				priceDiscount: true,
				stock: true,
				isReservable: true,
				imagesJson: true,
				store: {
					select: {
						id: true,
						name: true,
						mall: { select: { id: true, name: true } },
					},
				},
			},
			orderBy: { name: 'asc' },
			take: input.limit,
		});

		return {
			products: products.map((p) => ({
				id: p.id,
				name: p.name,
				category: p.category,
				priceOriginal: Math.round(p.priceOriginal.toNumber()),
				priceDiscount: p.priceDiscount
					? Math.round(p.priceDiscount.toNumber())
					: null,
				stock: p.stock,
				isReservable: p.isReservable,
				images: p.imagesJson ? JSON.parse(p.imagesJson) : [],
				store: { id: p.store.id, name: p.store.name, mall: p.store.mall },
			})),
		};
	});
