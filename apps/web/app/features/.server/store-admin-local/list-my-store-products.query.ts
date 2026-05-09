import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const mapProductStatus = (
	status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
) => {
	if (status === 'ACTIVE') return 'active' as const;
	if (status === 'INACTIVE') return 'inactive' as const;
	if (status === 'ARCHIVED') return 'archived' as const;
	return 'draft' as const;
};

export const listMyStoreProductsQuery = procedures.adminLocal
	.input(z.object({ storeId: z.string().trim().min(1) }))
	.query(async ({ input, ctx }) => {
		const { storeId } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const products = await prisma.product.findMany({
			where: { storeId },
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
				category: true,
				description: true,
				priceOriginal: true,
				priceDiscount: true,
				stock: true,
				isReservable: true,
				status: true,
				variantsJson: true,
				imagesJson: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return {
			products: products.map((p) => ({
				id: p.id,
				storeId,
				name: p.name,
				description: p.description ?? null,
				category: p.category,
				basePriceCents: Math.round(Number(p.priceOriginal)),
				priceDiscountCents: p.priceDiscount
					? Math.round(Number(p.priceDiscount))
					: null,
				status: mapProductStatus(p.status),
				isReservable: p.isReservable,
				isPublished: p.status === 'ACTIVE',
				images: p.imagesJson ? JSON.parse(p.imagesJson) : [],
				variants: p.variantsJson ? JSON.parse(p.variantsJson) : [],
				createdAt: p.createdAt.toISOString(),
				updatedAt: p.updatedAt.toISOString(),
			})),
		};
	});
