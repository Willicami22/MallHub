import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getPublicMallQuery = procedures.public
	.input(z.object({ mallId: z.string().trim().min(1) }))
	.query(async ({ input }) => {
		const mall = await prisma.mall.findFirst({
			where: { id: input.mallId, status: 'ACTIVE' },
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				description: true,
				heroImageUrl: true,
				_count: {
					select: {
						stores: { where: { status: 'ACTIVE' } },
					},
				},
			},
		});

		if (!mall) {
			throw new TRPCError({ code: 'NOT_FOUND' });
		}

		return {
			mall: {
				id: mall.id,
				name: mall.name,
				city: mall.city,
				address: mall.address,
				description: mall.description,
				heroImageUrl: mall.heroImageUrl,
				activeStoreCount: mall._count.stores,
			},
		};
	});
