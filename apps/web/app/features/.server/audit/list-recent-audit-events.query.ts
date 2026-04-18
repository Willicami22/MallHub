import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listRecentAuditEventsInputSchema = z.object({
	limit: z.number().int().min(1).max(50).default(10),
});

export const listRecentAuditEventsQuery = procedures.adminPlatform
	.input(listRecentAuditEventsInputSchema)
	.query(async ({ input }) => {
		const events = await prisma.auditEvent.findMany({
			orderBy: { createdAt: 'desc' },
			take: input.limit,
			select: {
				id: true,
				action: true,
				targetType: true,
				targetId: true,
				outcome: true,
				metadataJson: true,
				createdAt: true,
				actorUser: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				},
			},
		});

		return { events };
	});
