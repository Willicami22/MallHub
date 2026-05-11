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

const getCampaignPerformanceReportInputSchema = z.object({
	campaignId: z.string().trim().min(1),
});

const sanitizeFileNamePart = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const getCampaignPerformanceReportQuery = procedures.adminPlatform
	.input(getCampaignPerformanceReportInputSchema)
	.query(async ({ input }) => {
		const locale = getLocaleFromAsyncStorage();
		await syncExpiredCampaigns();

		const campaign = await prisma.campaign.findUnique({
			where: {
				id: input.campaignId,
			},
			select: {
				id: true,
				name: true,
				status: true,
				startsAt: true,
				endsAt: true,
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
				dailyMetrics: {
					orderBy: {
						metricDate: 'asc',
					},
					select: {
						metricDate: true,
						impressions: true,
						clicks: true,
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

		const totals = summarizeCampaignMetrics(campaign.dailyMetrics);
		const rows = campaign.dailyMetrics.map((metric) => ({
			date: metric.metricDate,
			impressions: metric.impressions,
			clicks: metric.clicks,
			ctr: computeCtr(metric.impressions, metric.clicks),
		}));

		const todayLabel = new Date().toISOString().slice(0, 10);
		return {
			report: {
				campaignId: campaign.id,
				campaignName: campaign.name,
				status: campaign.status,
				startsAt: campaign.startsAt,
				endsAt: campaign.endsAt,
				targetMalls: campaign.targetMalls.map((target) => target.mall),
				totals,
				rows,
				generatedAt: new Date(),
				fileName: `${sanitizeFileNamePart(campaign.name)}-performance-${todayLabel}.csv`,
			},
		};
	});
