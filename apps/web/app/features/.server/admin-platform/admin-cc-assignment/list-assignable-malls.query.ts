import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listAssignableMallsInputSchema = z.object({
	limit: z.number().int().min(1).max(30).default(12),
	search: z.string().trim().min(1).optional(),
});

export const listAssignableMallsQuery = procedures.adminPlatform
	.input(listAssignableMallsInputSchema)
	.query(async ({ input }) => {
		const malls = await prisma.mall.findMany({
			where: input.search
				? {
						OR: [
							{
								name: {
									contains: input.search,
									mode: 'insensitive',
								},
							},
							{
								city: {
									contains: input.search,
									mode: 'insensitive',
								},
							},
							{
								address: {
									contains: input.search,
									mode: 'insensitive',
								},
							},
						],
					}
				: undefined,
			orderBy: [{ status: 'asc' }, { name: 'asc' }],
			take: input.limit,
			select: {
				id: true,
				name: true,
				city: true,
				status: true,
				adminCcUser: {
					select: {
						id: true,
						name: true,
						email: true,
						banned: true,
					},
				},
			},
		});

		return {
			malls,
		};
	});
