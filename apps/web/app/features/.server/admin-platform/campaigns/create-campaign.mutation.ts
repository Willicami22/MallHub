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

const createCampaignInputSchema = z.object({
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
	activateOnCreate: z.boolean().default(false),
});

export const createCampaignMutation = procedures.adminPlatform
	.input(createCampaignInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const { startsAt, endsAt } = parseCampaignSchedule(
			input.startsAt,
			input.endsAt,
			locale,
		);
		const targetMallIds = await ensureTargetMallsExist(
			input.targetMallIds,
			locale,
		);
		const now = new Date();
		const shouldActivate = input.activateOnCreate;

		if (shouldActivate && startsAt.getTime() > now.getTime()) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_start_not_reached({}, { locale }),
			});
		}
		if (shouldActivate && endsAt.getTime() < now.getTime()) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_campaigns_validation_already_ended({}, { locale }),
			});
		}

		const campaign = await prisma.$transaction(async (tx) => {
			const created = await tx.campaign.create({
				data: {
					name: input.name.trim(),
					advertiserName: input.advertiserName.trim(),
					bannerType: input.bannerType,
					imageUrl: input.imageUrl.trim(),
					destinationUrl: input.destinationUrl.trim(),
					status: shouldActivate ? 'ACTIVE' : 'DRAFT',
					startsAt,
					endsAt,
					activatedAt: shouldActivate ? now : null,
					createdByUserId: ctx.user.id,
					updatedByUserId: ctx.user.id,
				},
				select: {
					id: true,
				},
			});

			await tx.campaignTargetMall.createMany({
				data: targetMallIds.map((mallId) => ({
					campaignId: created.id,
					mallId,
				})),
			});

			return tx.campaign.findUniqueOrThrow({
				where: {
					id: created.id,
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
			context: 'trpc.adminCampaigns.create',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_CAMPAIGN_CREATED,
			targetType: 'Campaign',
			targetId: campaign.id,
			metadata: {
				name: campaign.name,
				advertiserName: campaign.advertiserName,
				bannerType: campaign.bannerType,
				startsAt: campaign.startsAt.toISOString(),
				endsAt: campaign.endsAt.toISOString(),
				targetMallIds,
				status: campaign.status,
			},
		});

		if (shouldActivate) {
			await writeAuditEventBestEffort({
				context: 'trpc.adminCampaigns.create.activate',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_CAMPAIGN_ACTIVATED,
				targetType: 'Campaign',
				targetId: campaign.id,
				metadata: {
					name: campaign.name,
					activatedAt: now.toISOString(),
					targetMallIds,
					initialActivation: true,
				},
			});
		}

		return {
			campaign: {
				...campaign,
				targetMalls: campaign.targetMalls.map((target) => target.mall),
			},
		};
	});
