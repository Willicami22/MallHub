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

const toNullableTrimmed = (value: string | null | undefined): string | null => {
	const normalizedValue = value?.trim() ?? '';
	return normalizedValue.length > 0 ? normalizedValue : null;
};

const correctStoreProfileFromModerationInputSchema = z.object({
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
	name: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_moderation_validation_store_name_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	category: z.string().trim().max(120).nullable().optional(),
	description: z.string().trim().max(1000).nullable().optional(),
	contactEmail: z
		.string()
		.trim()
		.email({
			error: () =>
				m.admin_moderation_validation_contact_email_invalid(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(320)
		.nullable()
		.optional(),
	phone: z.string().trim().max(40).nullable().optional(),
});

export const correctStoreProfileFromModerationMutation =
	procedures.adminPlatform
		.input(correctStoreProfileFromModerationInputSchema)
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
							category: true,
							description: true,
							phone: true,
							contactEmail: true,
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

			if (report.targetType !== 'STORE_PROFILE') {
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

			const normalizedReason = input.reason.trim();
			const normalizedName = input.name.trim();
			const normalizedCategory = toNullableTrimmed(input.category);
			const normalizedDescription = toNullableTrimmed(input.description);
			const normalizedContactEmail = toNullableTrimmed(input.contactEmail);
			const normalizedPhone = toNullableTrimmed(input.phone);
			const reviewedAt = new Date();

			const result = await prisma.$transaction(async (tx) => {
				const store = await tx.store.update({
					where: {
						id: targetStore.id,
					},
					data: {
						name: normalizedName,
						category: normalizedCategory,
						description: normalizedDescription,
						contactEmail: normalizedContactEmail,
						phone: normalizedPhone,
					},
					select: {
						id: true,
						name: true,
						category: true,
						description: true,
						phone: true,
						contactEmail: true,
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
						resolutionAction: 'STORE_PROFILE_CORRECTED',
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
				context: 'trpc.adminModeration.correctStoreProfile',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_MODERATION_STORE_PROFILE_CORRECTED,
				targetType: 'Store',
				targetId: result.store.id,
				metadata: {
					moderationReportId: report.id,
					mallId: result.store.mall.id,
					reason: normalizedReason,
					previous: {
						name: targetStore.name,
						category: targetStore.category,
						description: targetStore.description,
						contactEmail: targetStore.contactEmail,
						phone: targetStore.phone,
					},
					next: {
						name: result.store.name,
						category: result.store.category,
						description: result.store.description,
						contactEmail: result.store.contactEmail,
						phone: result.store.phone,
					},
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
				actionKey: 'STORE_PROFILE_CORRECTED',
				targetLabel,
				actionLabel: m.admin_moderation_action_store_profile_corrected(
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
