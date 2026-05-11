import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const listPublicPromotionsQuery = procedures.public
	.input(
		z.object({
			mallId: z.string().trim().min(1),
			limit: z.number().int().min(1).max(20).default(6),
		}),
	)
	.query(async ({ input }) => {
		const now = new Date();
		const promotions = await prisma.promotion.findMany({
			where: {
				mallId: input.mallId,
				status: 'ACTIVE',
				store: { status: 'ACTIVE' },
				OR: [{ endsAt: null }, { endsAt: { gte: now } }],
			},
			select: {
				id: true,
				title: true,
				description: true,
				startsAt: true,
				endsAt: true,
				store: {
					select: {
						id: true,
						name: true,
						category: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			take: input.limit,
		});

		return { promotions };
	});
