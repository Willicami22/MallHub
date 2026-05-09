import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const deleteProductInputSchema = z.object({
	productId: z.string().trim().min(1),
	storeId: z.string().trim().min(1),
});

export const deleteProductMutation = procedures.adminLocal
	.input(deleteProductInputSchema)
	.mutation(async ({ input, ctx }) => {
		const store = await prisma.store.findUnique({
			where: { id: input.storeId },
			select: { id: true, ownerUserId: true },
		});

		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Tienda no encontrada o acceso denegado.',
			});
		}

		const product = await prisma.product.findUnique({
			where: { id: input.productId },
			select: { id: true, storeId: true },
		});

		if (!product || product.storeId !== input.storeId) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Producto no encontrado.',
			});
		}

		await prisma.product.delete({
			where: { id: input.productId },
		});

		return { productId: input.productId };
	});
