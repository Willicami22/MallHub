import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const listPublicStoreProductsQuery = procedures.public
	.input(
		z.object({
			storeId: z.string().trim().min(1),
			limit: z.number().int().min(1).max(50).default(24),
		}),
	)
	.query(async ({ input }) => {
		const { storeId, limit } = input;

		const products = await prisma.product.findMany({
			where: {
				storeId,
				status: 'ACTIVE',
				store: { status: 'ACTIVE', mall: { status: 'ACTIVE' } },
			},
			select: {
				id: true,
				name: true,
				category: true,
				description: true,
				priceOriginal: true,
				priceDiscount: true,
				stock: true,
				isReservable: true,
				imagesJson: true,
			},
			orderBy: { name: 'asc' },
			take: limit,
		});

		return {
			products: products.map((p) => ({
				id: p.id,
				name: p.name,
				category: p.category,
				description: p.description,
				priceOriginal: Math.round(p.priceOriginal.toNumber()),
				priceDiscount: p.priceDiscount
					? Math.round(p.priceDiscount.toNumber())
					: null,
				stock: p.stock,
				isReservable: p.isReservable,
				images: p.imagesJson ? JSON.parse(p.imagesJson) : [],
			})),
		};
	});
