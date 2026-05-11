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

const expireCampaignInputSchema = z.object({
	campaignId: z.string().trim().min(1),
});

export const expireCampaignMutation = procedures.adminPlatform
	.input(expireCampaignInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const campaign = await prisma.campaign.findUnique({
			where: {
				id: input.campaignId,
			},
			select: {
				id: true,
				name: true,
				status: true,
			},
		});
		if (!campaign) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_campaigns_not_found({}, { locale }),
			});
		}
		if (campaign.status === 'EXPIRED') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_already_ended({}, { locale }),
			});
		}

		const expiredAt = new Date();
		const updatedCampaign = await prisma.campaign.update({
			where: {
				id: campaign.id,
			},
			data: {
				status: 'EXPIRED',
				expiredAt,
				updatedByUserId: ctx.user.id,
			},
			select: {
				id: true,
				status: true,
				expiredAt: true,
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminCampaigns.expire',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_CAMPAIGN_EXPIRED,
			targetType: 'Campaign',
			targetId: updatedCampaign.id,
			metadata: {
				name: campaign.name,
				previousStatus: campaign.status,
				nextStatus: updatedCampaign.status,
				expiredAt: expiredAt.toISOString(),
			},
		});

		return { campaign: updatedCampaign };
	});
