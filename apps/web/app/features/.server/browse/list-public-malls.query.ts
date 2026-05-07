import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listPublicMallsInputSchema = z.object({
	limit: z.number().int().min(1).max(50).default(20),
	search: z.string().trim().optional(),
});

export const listPublicMallsQuery = procedures.public
	.input(listPublicMallsInputSchema)
	.query(async ({ input }) => {
		const { limit, search } = input;
		const normalizedSearch = search?.trim();

		const malls = await prisma.mall.findMany({
			where: {
				status: 'ACTIVE',
				...(normalizedSearch
					? {
							OR: [
								{ name: { contains: normalizedSearch, mode: 'insensitive' } },
								{ city: { contains: normalizedSearch, mode: 'insensitive' } },
							],
						}
					: {}),
			},
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				description: true,
				logoImageUrl: true,
				heroImageUrl: true,
				_count: {
					select: {
						stores: {
							where: { status: 'ACTIVE' },
						},
					},
				},
			},
			orderBy: { name: 'asc' },
			take: limit,
		});

		return {
			malls: malls.map((mall) => ({
				id: mall.id,
				name: mall.name,
				city: mall.city,
				address: mall.address,
				description: mall.description,
				logoImageUrl: mall.logoImageUrl,
				heroImageUrl: mall.heroImageUrl,
				activeStoreCount: mall._count.stores,
			})),
		};
	});
