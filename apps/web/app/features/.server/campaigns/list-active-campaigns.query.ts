import { z } from 'zod';
import { syncExpiredCampaigns } from '@/features/.server/admin-platform/campaigns/sync-expired-campaigns.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listActiveCampaignsInputSchema = z.object({
	limit: z.number().int().min(1).max(12).default(6),
	mallId: z.string().trim().min(1).optional(),
});

export const listActiveCampaignsQuery = procedures.public
	.input(listActiveCampaignsInputSchema)
	.query(async ({ input }) => {
		await syncExpiredCampaigns();
		const now = new Date();
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: 'ACTIVE',
				startsAt: {
					lte: now,
				},
				endsAt: {
					gte: now,
				},
				...(input.mallId
					? {
							targetMalls: {
								some: {
									mallId: input.mallId,
								},
							},
						}
					: {}),
			},
			orderBy: [{ updatedAt: 'desc' }, { startsAt: 'desc' }],
			take: input.limit,
			select: {
				id: true,
				name: true,
				advertiserName: true,
				bannerType: true,
				imageUrl: true,
				destinationUrl: true,
				targetMalls: {
					select: {
						mall: {
							select: {
								id: true,
								name: true,
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
		});

		return {
			campaigns: campaigns.map((campaign) => ({
				...campaign,
				targetMalls: campaign.targetMalls.map((target) => target.mall),
			})),
		};
	});
