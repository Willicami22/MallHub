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
import { ISO_DATE_INPUT_REGEX } from './campaign-date-input.lib';
import {
	ensureTargetMallsExist,
	parseCampaignSchedule,
} from './campaign-mutation-shared.lib';

const updateCampaignInputSchema = z.object({
	campaignId: z.string().trim().min(1),
	name: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_campaigns_validation_name_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	advertiserName: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_campaigns_validation_advertiser_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	bannerType: z.enum(['IMAGE', 'NATIVE_CARD']),
	imageUrl: z
		.string()
		.trim()
		.url({
			error: () =>
				m.admin_campaigns_validation_image_url_invalid(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		}),
	destinationUrl: z
		.string()
		.trim()
		.url({
			error: () =>
				m.admin_campaigns_validation_destination_url_invalid(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		}),
	startsAt: z.string().trim().regex(ISO_DATE_INPUT_REGEX),
	endsAt: z.string().trim().regex(ISO_DATE_INPUT_REGEX),
	targetMallIds: z.array(z.string().trim().min(1)).min(1),
});

export const updateCampaignMutation = procedures.adminPlatform
	.input(updateCampaignInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const existingCampaign = await prisma.campaign.findUnique({
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

		if (!existingCampaign) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_campaigns_not_found({}, { locale }),
			});
		}
		if (existingCampaign.status === 'EXPIRED') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_edit_expired({}, { locale }),
			});
		}

		const { startsAt, endsAt } = parseCampaignSchedule(
			input.startsAt,
			input.endsAt,
			locale,
		);
		const targetMallIds = await ensureTargetMallsExist(
			input.targetMallIds,
			locale,
		);

		const campaign = await prisma.$transaction(async (tx) => {
			await tx.campaign.update({
				where: {
					id: existingCampaign.id,
				},
				data: {
					name: input.name.trim(),
					advertiserName: input.advertiserName.trim(),
					bannerType: input.bannerType,
					imageUrl: input.imageUrl.trim(),
					destinationUrl: input.destinationUrl.trim(),
					startsAt,
					endsAt,
					updatedByUserId: ctx.user.id,
				},
				select: {
					id: true,
				},
			});

			await tx.campaignTargetMall.deleteMany({
				where: {
					campaignId: existingCampaign.id,
				},
			});
			await tx.campaignTargetMall.createMany({
				data: targetMallIds.map((mallId) => ({
					campaignId: existingCampaign.id,
					mallId,
				})),
			});

			return tx.campaign.findUniqueOrThrow({
				where: {
					id: existingCampaign.id,
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
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminCampaigns.update',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_CAMPAIGN_UPDATED,
			targetType: 'Campaign',
			targetId: campaign.id,
			metadata: {
				previousName: existingCampaign.name,
				nextName: campaign.name,
				previousStartsAt: existingCampaign.startsAt.toISOString(),
				nextStartsAt: campaign.startsAt.toISOString(),
				previousEndsAt: existingCampaign.endsAt.toISOString(),
				nextEndsAt: campaign.endsAt.toISOString(),
				previousTargetMallIds: existingCampaign.targetMalls.map(
					(target) => target.mallId,
				),
				nextTargetMallIds: targetMallIds,
			},
		});

		return {
			campaign: {
				...campaign,
				targetMalls: campaign.targetMalls.map((target) => target.mall),
			},
		};
	});
