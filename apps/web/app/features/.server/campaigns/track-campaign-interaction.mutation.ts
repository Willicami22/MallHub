import { z } from 'zod';
import { syncExpiredCampaigns } from '@/features/.server/admin-platform/campaigns/sync-expired-campaigns.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const trackCampaignInteractionInputSchema = z.object({
	campaignId: z.string().trim().min(1),
	eventType: z.enum(['IMPRESSION', 'CLICK']),
});

const getUtcDayStart = (date: Date): Date =>
	new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);

export const trackCampaignInteractionMutation = procedures.public
	.input(trackCampaignInteractionInputSchema)
	.mutation(async ({ input }) => {
		await syncExpiredCampaigns();
		const now = new Date();
		const campaign = await prisma.campaign.findFirst({
			where: {
				id: input.campaignId,
				status: 'ACTIVE',
				startsAt: {
					lte: now,
				},
				endsAt: {
					gte: now,
				},
			},
			select: {
				id: true,
			},
		});

		if (!campaign) {
			return {
				tracked: false,
			};
		}

		const metricDate = getUtcDayStart(now);
		await prisma.campaignDailyMetric.upsert({
			where: {
				campaignId_metricDate: {
					campaignId: campaign.id,
					metricDate,
				},
			},
			create: {
				campaignId: campaign.id,
				metricDate,
				impressions: input.eventType === 'IMPRESSION' ? 1 : 0,
				clicks: input.eventType === 'CLICK' ? 1 : 0,
			},
			update: {
				impressions: {
					increment: input.eventType === 'IMPRESSION' ? 1 : 0,
				},
				clicks: {
					increment: input.eventType === 'CLICK' ? 1 : 0,
				},
			},
		});

		return {
			tracked: true,
		};
	});
