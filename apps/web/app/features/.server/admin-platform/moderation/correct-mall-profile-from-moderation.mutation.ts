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

const correctMallProfileFromModerationInputSchema = z.object({
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
				m.admin_moderation_validation_mall_name_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	city: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_moderation_validation_mall_city_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	address: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_moderation_validation_mall_address_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(300),
	description: z.string().trim().max(1000).nullable().optional(),
});

export const correctMallProfileFromModerationMutation = procedures.adminPlatform
	.input(correctMallProfileFromModerationInputSchema)
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
						city: true,
						address: true,
						description: true,
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

		if (report.targetType !== 'MALL_PROFILE') {
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

		const normalizedReason = input.reason.trim();
		const normalizedName = input.name.trim();
		const normalizedCity = input.city.trim();
		const normalizedAddress = input.address.trim();
		const normalizedDescription = toNullableTrimmed(input.description);
		const reviewedAt = new Date();

		const result = await prisma.$transaction(async (tx) => {
			const mall = await tx.mall.update({
				where: {
					id: targetMall.id,
				},
				data: {
					name: normalizedName,
					city: normalizedCity,
					address: normalizedAddress,
					description: normalizedDescription,
				},
				select: {
					id: true,
					name: true,
					city: true,
					address: true,
					description: true,
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
					resolutionAction: 'MALL_PROFILE_CORRECTED',
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
			context: 'trpc.adminModeration.correctMallProfile',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MODERATION_MALL_PROFILE_CORRECTED,
			targetType: 'Mall',
			targetId: result.mall.id,
			metadata: {
				moderationReportId: report.id,
				reason: normalizedReason,
				previous: {
					name: targetMall.name,
					city: targetMall.city,
					address: targetMall.address,
					description: targetMall.description,
				},
				next: {
					name: result.mall.name,
					city: result.mall.city,
					address: result.mall.address,
					description: result.mall.description,
				},
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
			actionKey: 'MALL_PROFILE_CORRECTED',
			targetLabel,
			actionLabel: m.admin_moderation_action_mall_profile_corrected(
				{},
				{ locale },
			),
			reason: normalizedReason,
			adminLocalUser: null,
			adminCcUser: result.mall.adminCcUser,
			changedByName: ctx.user.name,
		});

		return result;
	});
