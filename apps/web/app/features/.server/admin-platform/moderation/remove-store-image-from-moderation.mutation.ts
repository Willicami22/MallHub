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

const removeStoreImageFromModerationInputSchema = z.object({
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

export const removeStoreImageFromModerationMutation = procedures.adminPlatform
	.input(removeStoreImageFromModerationInputSchema)
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
				store: {
					select: {
						id: true,
						name: true,
						logoImageUrl: true,
						owner: {
							select: {
								name: true,
								email: true,
							},
						},
						mall: {
							select: {
								id: true,
								name: true,
								adminCcUser: {
									select: {
										name: true,
										email: true,
									},
								},
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

		if (report.targetType !== 'STORE_IMAGE') {
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

		if (!report.store) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_moderation_store_not_found({}, { locale }),
			});
		}
		const targetStore = report.store;

		if (!targetStore.logoImageUrl) {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_moderation_store_image_already_removed({}, { locale }),
			});
		}

		const normalizedReason = input.reason.trim();
		const reviewedAt = new Date();
		const previousImageUrl = targetStore.logoImageUrl;

		const result = await prisma.$transaction(async (tx) => {
			const store = await tx.store.update({
				where: {
					id: targetStore.id,
				},
				data: {
					logoImageUrl: null,
				},
				select: {
					id: true,
					name: true,
					logoImageUrl: true,
					owner: {
						select: {
							name: true,
							email: true,
						},
					},
					mall: {
						select: {
							id: true,
							name: true,
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

			const reviewedReport = await tx.moderationReport.update({
				where: {
					id: report.id,
				},
				data: {
					status: 'RESOLVED',
					resolutionAction: 'STORE_IMAGE_REMOVED',
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
				store,
				report: reviewedReport,
			};
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminModeration.removeStoreImage',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MODERATION_STORE_IMAGE_REMOVED,
			targetType: 'Store',
			targetId: result.store.id,
			metadata: {
				moderationReportId: report.id,
				mallId: result.store.mall.id,
				reason: normalizedReason,
				previousImageUrl,
				nextImageUrl: result.store.logoImageUrl,
			},
		});

		const fallbackTargetName = m.admin_moderation_target_unknown(
			{},
			{ locale },
		);
		const targetLabel = resolveModerationTargetName({
			store: result.store,
			fallbackTargetName,
		});

		notifyModerationDecision({
			moderationReportId: report.id,
			actionKey: 'STORE_IMAGE_REMOVED',
			targetLabel,
			actionLabel: m.admin_moderation_action_store_image_removed(
				{},
				{ locale },
			),
			reason: normalizedReason,
			adminLocalUser: result.store.owner,
			adminCcUser: result.store.mall.adminCcUser,
			changedByName: ctx.user.name,
		});

		return result;
	});
