import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';
import {
	computeCtr,
	summarizeCampaignMetrics,
} from './campaign-performance.lib';
import { syncExpiredCampaigns } from './sync-expired-campaigns.lib';

const getCampaignInputSchema = z.object({
	campaignId: z.string().trim().min(1),
});

export const getCampaignQuery = procedures.adminPlatform
	.input(getCampaignInputSchema)
	.query(async ({ input }) => {
		const locale = getLocaleFromAsyncStorage();
		const autoExpiredCount = await syncExpiredCampaigns();

		const campaign = await prisma.campaign.findUnique({
			where: {
				id: input.campaignId,
			},
			select: {
				id: true,
				name: true,
				advertiserName: true,
				bannerType: true,
				imageUrl: true,
				destinationUrl: true,
				status: true,
				startsAt: true,
				endsAt: true,
				activatedAt: true,
				pausedAt: true,
				expiredAt: true,
				createdAt: true,
				updatedAt: true,
				targetMalls: {
					select: {
						mall: {
							select: {
								id: true,
								name: true,
								city: true,
								status: true,
							},
						},
					},
					orderBy: {
						mall: {
							name: 'asc',
						},
					},
				},
				dailyMetrics: {
					orderBy: {
						metricDate: 'asc',
					},
					select: {
						id: true,
						metricDate: true,
						impressions: true,
						clicks: true,
						updatedAt: true,
					},
				},
			},
		});

		if (!campaign) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_campaigns_not_found({}, { locale }),
			});
		}

		const metricTotals = summarizeCampaignMetrics(campaign.dailyMetrics);
		const metricRows = campaign.dailyMetrics.map((metric) => ({
			...metric,
			ctr: computeCtr(metric.impressions, metric.clicks),
		}));

		return {
			campaign: {
				...campaign,
				targetMalls: campaign.targetMalls.map((target) => target.mall),
				performance: {
					...metricTotals,
					dailyMetrics: metricRows,
				},
			},
			autoExpiredCount,
		};
	});
