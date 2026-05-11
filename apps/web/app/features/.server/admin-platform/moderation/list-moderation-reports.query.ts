import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listModerationReportsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	statusFilter: z.enum(['OPEN', 'RESOLVED', 'DISMISSED']).optional(),
	targetTypeFilter: z
		.enum([
			'PRODUCT',
			'STORE_PROFILE',
			'MALL_PROFILE',
			'STORE_IMAGE',
			'MALL_IMAGE',
		])
		.optional(),
	sortBy: z.enum(['createdAt', 'status', 'targetType']).default('createdAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const getModerationReportOrderBy = (
	sortBy: z.infer<typeof listModerationReportsInputSchema>['sortBy'],
	sortDirection: z.infer<
		typeof listModerationReportsInputSchema
	>['sortDirection'],
): Prisma.ModerationReportOrderByWithRelationInput => {
	if (sortBy === 'status') {
		return {
			status: sortDirection,
		};
	}

	if (sortBy === 'targetType') {
		return {
			targetType: sortDirection,
		};
	}

	return {
		createdAt: sortDirection,
	};
};

export type ListModerationReportsInput = z.infer<
	typeof listModerationReportsInputSchema
>;

export const listModerationReportsQuery = procedures.adminPlatform
	.input(listModerationReportsInputSchema)
	.query(async ({ input }) => {
		const {
			page,
			pageSize,
			search,
			statusFilter,
			targetTypeFilter,
			sortBy,
			sortDirection,
		} = input;
		const normalizedSearch = search?.trim();

		const where: Prisma.ModerationReportWhereInput = {
			...(statusFilter ? { status: statusFilter } : {}),
			...(targetTypeFilter ? { targetType: targetTypeFilter } : {}),
			...(normalizedSearch
				? {
						OR: [
							{
								reason: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								product: {
									is: {
										name: {
											contains: normalizedSearch,
											mode: 'insensitive',
										},
									},
								},
							},
							{
								store: {
									is: {
										name: {
											contains: normalizedSearch,
											mode: 'insensitive',
										},
									},
								},
							},
							{
								mall: {
									is: {
										name: {
											contains: normalizedSearch,
											mode: 'insensitive',
										},
									},
								},
							},
						],
					}
				: {}),
		};

		const [reports, total] = await Promise.all([
			prisma.moderationReport.findMany({
				where,
				select: {
					id: true,
					targetType: true,
					reason: true,
					status: true,
					resolutionAction: true,
					resolutionReason: true,
					createdAt: true,
					reviewedAt: true,
					product: {
						select: {
							id: true,
							name: true,
							status: true,
							store: {
								select: {
									id: true,
									name: true,
								},
							},
							mall: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					store: {
						select: {
							id: true,
							name: true,
							mall: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					mall: {
						select: {
							id: true,
							name: true,
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
				orderBy: getModerationReportOrderBy(sortBy, sortDirection),
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.moderationReport.count({ where }),
		]);

		return {
			reports,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	});
