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
import { syncExpiredCampaigns } from './sync-expired-campaigns.lib';

const activateCampaignInputSchema = z.object({
	campaignId: z.string().trim().min(1),
});

export const activateCampaignMutation = procedures.adminPlatform
	.input(activateCampaignInputSchema)
	.mutation(async ({ ctx, input }) => {
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
						mallId: true,
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
		if (campaign.status === 'ACTIVE') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_already_active({}, { locale }),
			});
		}
		if (campaign.status === 'EXPIRED') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_already_ended({}, { locale }),
			});
		}
		if (campaign.targetMalls.length === 0) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_target_mall_required(
					{},
					{ locale },
				),
			});
		}

		const now = new Date();
		if (campaign.startsAt.getTime() > now.getTime()) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_start_not_reached({}, { locale }),
			});
		}
		if (campaign.endsAt.getTime() < now.getTime()) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_already_ended({}, { locale }),
			});
		}

		const updatedCampaign = await prisma.campaign.update({
			where: {
				id: campaign.id,
			},
			data: {
				status: 'ACTIVE',
				activatedAt: now,
				pausedAt: null,
				updatedByUserId: ctx.user.id,
			},
			select: {
				id: true,
				status: true,
				activatedAt: true,
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminCampaigns.activate',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_CAMPAIGN_ACTIVATED,
			targetType: 'Campaign',
			targetId: updatedCampaign.id,
			metadata: {
				name: campaign.name,
				previousStatus: campaign.status,
				nextStatus: updatedCampaign.status,
				activatedAt: now.toISOString(),
			},
		});

		return { campaign: updatedCampaign };
	});
