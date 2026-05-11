import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyModerationDecision } from '@/features/.server/admin-platform/moderation/moderation-notification.lib';
import { resolveModerationTargetName } from '@/features/.server/admin-platform/moderation/moderation-target-context.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const removeMallImageFromModerationInputSchema = z.object({
	reportId: z.string().trim().min(1),
	reason: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_moderation_validation_reason_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(500),
});

export const removeMallImageFromModerationMutation = procedures.adminPlatform
	.input(removeMallImageFromModerationInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const report = await prisma.moderationReport.findUnique({
			where: {
				id: input.reportId,
			},
			select: {
				id: true,
				targetType: true,
				status: true,
				mall: {
					select: {
						id: true,
						name: true,
						heroImageUrl: true,
						adminCcUser: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});

		if (!report) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_moderation_not_found({}, { locale }),
			});
		}

		if (report.targetType !== 'MALL_IMAGE') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_moderation_target_type_mismatch({}, { locale }),
			});
		}

		if (report.status !== 'OPEN') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_moderation_not_open({}, { locale }),
			});
		}

		if (!report.mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_moderation_mall_not_found({}, { locale }),
			});
		}
		const targetMall = report.mall;

		if (!targetMall.heroImageUrl) {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_moderation_mall_image_already_removed({}, { locale }),
			});
		}

		const normalizedReason = input.reason.trim();
		const reviewedAt = new Date();
		const previousImageUrl = targetMall.heroImageUrl;

		const result = await prisma.$transaction(async (tx) => {
			const mall = await tx.mall.update({
				where: {
					id: targetMall.id,
				},
				data: {
					heroImageUrl: null,
				},
				select: {
					id: true,
					name: true,
					heroImageUrl: true,
					adminCcUser: {
						select: {
							name: true,
							email: true,
						},
					},
				},
			});

			const reviewedReport = await tx.moderationReport.update({
				where: {
					id: report.id,
				},
				data: {
					status: 'RESOLVED',
					resolutionAction: 'MALL_IMAGE_REMOVED',
					resolutionReason: normalizedReason,
					reviewedByUserId: ctx.user.id,
					reviewedAt,
				},
				select: {
					id: true,
					status: true,
					resolutionAction: true,
					resolutionReason: true,
					reviewedAt: true,
				},
			});

			return {
				mall,
				report: reviewedReport,
			};
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminModeration.removeMallImage',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MODERATION_MALL_IMAGE_REMOVED,
			targetType: 'Mall',
			targetId: result.mall.id,
			metadata: {
				moderationReportId: report.id,
				reason: normalizedReason,
				previousImageUrl,
				nextImageUrl: result.mall.heroImageUrl,
			},
		});

		const fallbackTargetName = m.admin_moderation_target_unknown(
			{},
			{ locale },
		);
		const targetLabel = resolveModerationTargetName({
			mall: result.mall,
			fallbackTargetName,
		});

		notifyModerationDecision({
			moderationReportId: report.id,
			actionKey: 'MALL_IMAGE_REMOVED',
			targetLabel,
			actionLabel: m.admin_moderation_action_mall_image_removed({}, { locale }),
			reason: normalizedReason,
			adminLocalUser: null,
			adminCcUser: result.mall.adminCcUser,
			changedByName: ctx.user.name,
		});

		return result;
	});
