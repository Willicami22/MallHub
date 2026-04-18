import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listAdminCcAssignmentsInputSchema = z.object({
	limit: z.number().int().min(1).max(50).default(10),
	mallId: z.string().trim().min(1).optional(),
	adminCcUserId: z.string().trim().min(1).optional(),
});

export const listAdminCcAssignmentsQuery = procedures.adminPlatform
	.input(listAdminCcAssignmentsInputSchema)
	.query(async ({ input }) => {
		const assignments = await prisma.adminCcAssignment.findMany({
			where: {
				...(input.mallId ? { mallId: input.mallId } : {}),
				...(input.adminCcUserId ? { adminCcUserId: input.adminCcUserId } : {}),
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: input.limit,
			select: {
				id: true,
				createdAt: true,
				mall: {
					select: {
						id: true,
						name: true,
						status: true,
						adminCcUserId: true,
					},
				},
				adminCcUser: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						banned: true,
					},
				},
				createdByUser: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				},
			},
		});

		return { assignments };
	});
