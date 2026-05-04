import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getPublicProductQuery = procedures.public
	.input(z.object({ productId: z.string().trim().min(1) }))
	.query(async ({ input }) => {
		const product = await prisma.product.findFirst({
			where: {
				id: input.productId,
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
				store: {
					select: {
						id: true,
						name: true,
						mall: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		if (!product) {
			throw new TRPCError({ code: 'NOT_FOUND' });
		}

		return {
			product: {
				id: product.id,
				name: product.name,
				category: product.category,
				description: product.description,
				priceOriginal: product.priceOriginal.toNumber(),
				priceDiscount: product.priceDiscount?.toNumber() ?? null,
				stock: product.stock,
				isReservable: product.isReservable,
				variantsJson: null,
				store: product.store,
			},
		};
	});
