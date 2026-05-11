import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';
import {
	ISO_DATE_INPUT_REGEX,
	parseIsoDateInput,
} from './campaign-date-input.lib';

const upsertCampaignDailyMetricInputSchema = z
	.object({
		campaignId: z.string().trim().min(1),
		metricDate: z.string().trim().regex(ISO_DATE_INPUT_REGEX),
		impressions: z.number().int().min(0),
		clicks: z.number().int().min(0),
	})
	.refine((value) => value.clicks <= value.impressions, {
		message: m.admin_campaigns_validation_clicks_exceed_impressions(),
		path: ['clicks'],
	});

export const upsertCampaignDailyMetricMutation = procedures.adminPlatform
	.input(upsertCampaignDailyMetricInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const metricDate = parseIsoDateInput(input.metricDate, 'start');
		if (!metricDate) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_date_invalid({}, { locale }),
			});
		}

		const campaign = await prisma.campaign.findUnique({
			where: {
				id: input.campaignId,
			},
			select: {
				id: true,
				name: true,
			},
		});
		if (!campaign) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_campaigns_not_found({}, { locale }),
			});
		}

		const metric = await prisma.campaignDailyMetric.upsert({
			where: {
				campaignId_metricDate: {
					campaignId: campaign.id,
					metricDate,
				},
			},
			create: {
				campaignId: campaign.id,
				metricDate,
				impressions: input.impressions,
				clicks: input.clicks,
			},
			update: {
				impressions: input.impressions,
				clicks: input.clicks,
			},
			select: {
				id: true,
				metricDate: true,
				impressions: true,
				clicks: true,
				updatedAt: true,
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminCampaigns.upsertDailyMetric',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_CAMPAIGN_DAILY_METRIC_UPSERTED,
			targetType: 'CampaignDailyMetric',
			targetId: metric.id,
			metadata: {
				campaignId: campaign.id,
				campaignName: campaign.name,
				metricDate: metricDate.toISOString(),
				impressions: input.impressions,
				clicks: input.clicks,
			},
		});

		return { metric };
	});
