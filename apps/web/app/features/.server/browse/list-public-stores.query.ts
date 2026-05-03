import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listPublicStoresInputSchema = z.object({
	limit: z.number().int().min(1).max(50).default(24),
	mallId: z.string().trim().min(1).optional(),
	search: z.string().trim().optional(),
	category: z.string().trim().optional(),
});

export const listPublicStoresQuery = procedures.public
	.input(listPublicStoresInputSchema)
	.query(async ({ input }) => {
		const { limit, mallId, search, category } = input;
		const normalizedSearch = search?.trim();
		const normalizedCategory = category?.trim();

		const stores = await prisma.store.findMany({
			where: {
				status: 'ACTIVE',
				mall: { status: 'ACTIVE' },
				...(mallId ? { mallId } : {}),
				...(normalizedCategory
					? { category: { contains: normalizedCategory, mode: 'insensitive' } }
					: {}),
				...(normalizedSearch
					? {
							OR: [
								{ name: { contains: normalizedSearch, mode: 'insensitive' } },
								{
									category: {
										contains: normalizedSearch,
										mode: 'insensitive',
									},
								},
							],
						}
					: {}),
			},
			select: {
				id: true,
				name: true,
				category: true,
				description: true,
				logoImageUrl: true,
				floor: true,
				openHours: true,
				mall: {
					select: {
						id: true,
						name: true,
						city: true,
					},
				},
			},
			orderBy: { name: 'asc' },
			take: limit,
		});

		return { stores };
	});
