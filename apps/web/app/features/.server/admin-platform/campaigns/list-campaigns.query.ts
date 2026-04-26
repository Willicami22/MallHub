import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { computeCtr } from './campaign-performance.lib';
import { syncExpiredCampaigns } from './sync-expired-campaigns.lib';

const listCampaignsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	statusFilter: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED']).optional(),
	mallId: z.string().trim().min(1).optional(),
	sortBy: z
		.enum(['name', 'createdAt', 'updatedAt', 'startsAt', 'endsAt'])
		.default('updatedAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const getOrderBy = (
	sortBy: z.infer<typeof listCampaignsInputSchema>['sortBy'],
	sortDirection: z.infer<typeof listCampaignsInputSchema>['sortDirection'],
): Prisma.CampaignOrderByWithRelationInput => {
	if (sortBy === 'name') {
		return {
			name: sortDirection,
		};
	}

	if (sortBy === 'createdAt') {
		return {
			createdAt: sortDirection,
		};
	}

	if (sortBy === 'startsAt') {
		return {
			startsAt: sortDirection,
		};
	}

	if (sortBy === 'endsAt') {
		return {
			endsAt: sortDirection,
		};
	}

	return {
		updatedAt: sortDirection,
	};
};

export const listCampaignsQuery = procedures.adminPlatform
	.input(listCampaignsInputSchema)
	.query(async ({ input }) => {
		const autoExpiredCount = await syncExpiredCampaigns();
		const {
			page,
			pageSize,
			search,
			statusFilter,
			mallId,
			sortBy,
			sortDirection,
		} = input;
		const normalizedSearch = search?.trim();

		const where: Prisma.CampaignWhereInput = {
			...(statusFilter ? { status: statusFilter } : {}),
			...(mallId
				? {
						targetMalls: {
							some: {
								mallId,
							},
						},
					}
				: {}),
			...(normalizedSearch
				? {
						OR: [
							{
								name: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								advertiserName: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
						],
					}
				: {}),
		};

		const [campaigns, total] = await Promise.all([
			prisma.campaign.findMany({
				where,
				select: {
					id: true,
					name: true,
					advertiserName: true,
					bannerType: true,
					status: true,
					startsAt: true,
					endsAt: true,
					createdAt: true,
					updatedAt: true,
					targetMalls: {
						select: {
							mall: {
								select: {
									id: true,
									name: true,
									city: true,
								},
							},
						},
						orderBy: {
							mall: {
								name: 'asc',
							},
						},
					},
				},
				orderBy: getOrderBy(sortBy, sortDirection),
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.campaign.count({ where }),
		]);

		const campaignIds = campaigns.map((campaign) => campaign.id);
		const metricsByCampaignId =
			campaignIds.length > 0
				? await prisma.campaignDailyMetric.groupBy({
						by: ['campaignId'],
						where: {
							campaignId: {
								in: campaignIds,
							},
						},
						_sum: {
							impressions: true,
							clicks: true,
						},
					})
				: [];
		const metricMap = new Map(
			metricsByCampaignId.map((metric) => [
				metric.campaignId,
				{
					impressions: metric._sum.impressions ?? 0,
					clicks: metric._sum.clicks ?? 0,
				},
			]),
		);

		return {
			campaigns: campaigns.map((campaign) => {
				const totals = metricMap.get(campaign.id) ?? {
					impressions: 0,
					clicks: 0,
				};
				return {
					...campaign,
					targetMalls: campaign.targetMalls.map((target) => target.mall),
					impressions: totals.impressions,
					clicks: totals.clicks,
					ctr: computeCtr(totals.impressions, totals.clicks),
				};
			}),
			total,
			page,
			pageSize,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
			autoExpiredCount,
		};
	});
