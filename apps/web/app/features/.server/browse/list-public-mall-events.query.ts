import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const listPublicMallEventsQuery = procedures.public
	.input(z.object({ mallId: z.string().trim().min(1) }))
	.query(async ({ input }) => {
		const now = new Date();

		const events = await prisma.mallEvent.findMany({
			where: {
				mallId: input.mallId,
				status: 'PUBLISHED',
				endDate: { gte: now },
			},
			orderBy: { startDate: 'asc' },
			take: 5,
			select: {
				id: true,
				name: true,
				description: true,
				startDate: true,
				endDate: true,
			},
		});

		return { events };
	});
