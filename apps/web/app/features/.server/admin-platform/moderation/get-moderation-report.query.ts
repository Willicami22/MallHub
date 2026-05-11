import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const getModerationReportInputSchema = z.object({
	reportId: z.string().trim().min(1),
});

export const getModerationReportQuery = procedures.adminPlatform
	.input(getModerationReportInputSchema)
	.query(async ({ input }) => {
		const locale = getLocaleFromAsyncStorage();
		const report = await prisma.moderationReport.findUnique({
			where: {
				id: input.reportId,
			},
			select: {
				id: true,
				targetType: true,
				reason: true,
				detailsJson: true,
				status: true,
				resolutionAction: true,
				resolutionReason: true,
				createdAt: true,
				updatedAt: true,
				reviewedAt: true,
				product: {
					select: {
						id: true,
						name: true,
						category: true,
						description: true,
						status: true,
						store: {
							select: {
								id: true,
								name: true,
								owner: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
							},
						},
						mall: {
							select: {
								id: true,
								name: true,
								adminCcUser: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
							},
						},
					},
				},
				store: {
					select: {
						id: true,
						name: true,
						category: true,
						description: true,
						phone: true,
						contactEmail: true,
						logoImageUrl: true,
						owner: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						mall: {
							select: {
								id: true,
								name: true,
								adminCcUser: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
							},
						},
					},
				},
				mall: {
					select: {
						id: true,
						name: true,
						city: true,
						address: true,
						description: true,
						heroImageUrl: true,
						adminCcUser: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				reportedByUser: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				reviewedByUser: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!report) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_moderation_not_found({}, { locale }),
			});
		}

		return {
			report,
		};
	});
