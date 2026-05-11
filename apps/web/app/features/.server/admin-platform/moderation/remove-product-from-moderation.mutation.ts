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

const removeProductFromModerationInputSchema = z.object({
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

export const removeProductFromModerationMutation = procedures.adminPlatform
	.input(removeProductFromModerationInputSchema)
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
				product: {
					select: {
						id: true,
						name: true,
						status: true,
						store: {
							select: {
								id: true,
								name: true,
								owner: {
									select: {
										name: true,
										email: true,
									},
								},
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

		if (report.targetType !== 'PRODUCT') {
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

		if (!report.product) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_moderation_product_not_found({}, { locale }),
			});
		}
		const targetProduct = report.product;

		if (targetProduct.status === 'ARCHIVED') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_moderation_product_already_removed({}, { locale }),
			});
		}

		const normalizedReason = input.reason.trim();
		const reviewedAt = new Date();
		const previousStatus = targetProduct.status;
		const result = await prisma.$transaction(async (tx) => {
			const product = await tx.product.update({
				where: {
					id: targetProduct.id,
				},
				data: {
					status: 'ARCHIVED',
				},
				select: {
					id: true,
					name: true,
					status: true,
					store: {
						select: {
							id: true,
							name: true,
							owner: {
								select: {
									name: true,
									email: true,
								},
							},
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
					resolutionAction: 'PRODUCT_REMOVED',
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
				product,
				report: reviewedReport,
			};
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminModeration.removeProduct',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MODERATION_PRODUCT_REMOVED,
			targetType: 'Product',
			targetId: result.product.id,
			metadata: {
				moderationReportId: report.id,
				previousStatus,
				nextStatus: result.product.status,
				mallId: result.product.mall.id,
				storeId: result.product.store.id,
				reason: normalizedReason,
			},
		});

		const fallbackTargetName = m.admin_moderation_target_unknown(
			{},
			{ locale },
		);
		const targetLabel = resolveModerationTargetName({
			product: result.product,
			fallbackTargetName,
		});

		notifyModerationDecision({
			moderationReportId: report.id,
			actionKey: 'PRODUCT_REMOVED',
			targetLabel,
			actionLabel: m.admin_moderation_action_product_removed({}, { locale }),
			reason: normalizedReason,
			adminLocalUser: result.product.store.owner,
			adminCcUser: result.product.mall.adminCcUser,
			changedByName: ctx.user.name,
		});

		return result;
	});
