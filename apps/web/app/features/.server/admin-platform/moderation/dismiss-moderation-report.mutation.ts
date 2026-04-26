import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyModerationDecision } from '@/features/.server/admin-platform/moderation/moderation-notification.lib';
import {
	resolveModerationRecipients,
	resolveModerationTargetName,
} from '@/features/.server/admin-platform/moderation/moderation-target-context.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const dismissModerationReportInputSchema = z.object({
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

export const dismissModerationReportMutation = procedures.adminPlatform
	.input(dismissModerationReportInputSchema)
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
						name: true,
						store: {
							select: {
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
				store: {
					select: {
						name: true,
						owner: {
							select: {
								name: true,
								email: true,
							},
						},
						mall: {
							select: {
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
				mall: {
					select: {
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

		if (!report) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_moderation_not_found({}, { locale }),
			});
		}

		if (report.status !== 'OPEN') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_moderation_not_open({}, { locale }),
			});
		}

		const normalizedReason = input.reason.trim();
		const reviewedAt = new Date();

		const reviewedReport = await prisma.moderationReport.update({
			where: {
				id: report.id,
			},
			data: {
				status: 'DISMISSED',
				resolutionAction: 'REPORT_DISMISSED',
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

		await writeAuditEventBestEffort({
			context: 'trpc.adminModeration.dismiss',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MODERATION_REPORT_DISMISSED,
			targetType: 'ModerationReport',
			targetId: report.id,
			metadata: {
				moderationTargetType: report.targetType,
				reason: normalizedReason,
			},
		});

		const fallbackTargetName = m.admin_moderation_target_unknown(
			{},
			{ locale },
		);
		const recipients = resolveModerationRecipients({
			product: report.product,
			store: report.store,
			mall: report.mall,
			fallbackTargetName,
		});
		const targetLabel = resolveModerationTargetName({
			product: report.product,
			store: report.store,
			mall: report.mall,
			fallbackTargetName,
		});

		notifyModerationDecision({
			moderationReportId: report.id,
			actionKey: 'REPORT_DISMISSED',
			targetLabel,
			actionLabel: m.admin_moderation_action_report_dismissed({}, { locale }),
			reason: normalizedReason,
			adminLocalUser: recipients.adminLocalUser,
			adminCcUser: recipients.adminCcUser,
			changedByName: ctx.user.name,
		});

		return {
			report: reviewedReport,
		};
	});
