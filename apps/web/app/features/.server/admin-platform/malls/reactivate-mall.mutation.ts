import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	getMallActivationReadiness,
	type MallActivationRequirementCode,
} from '@/features/.server/admin-platform/malls/mall-activation-readiness.lib';
import { notifyMallStatusChange } from '@/features/.server/admin-platform/malls/mall-status-notification.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const reactivateMallInputSchema = z.object({
	mallId: z.string().trim().min(1),
	reason: z.string().trim().max(500).optional(),
});

const getActivationRequirementLabel = (
	requirement: MallActivationRequirementCode,
): string => {
	const locale = getLocaleFromAsyncStorage();
	if (requirement === 'NAME') {
		return m.admin_malls_activation_requirement_name({}, { locale });
	}

	if (requirement === 'CITY') {
		return m.admin_malls_activation_requirement_city({}, { locale });
	}

	if (requirement === 'ADDRESS') {
		return m.admin_malls_activation_requirement_address({}, { locale });
	}

	return m.admin_malls_activation_requirement_admin_cc({}, { locale });
};

export const reactivateMallMutation = procedures.adminPlatform
	.input(reactivateMallInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const mall = await prisma.mall.findUnique({
			where: {
				id: input.mallId,
			},
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				status: true,
				adminCcUserId: true,
				adminCcUser: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_malls_not_found({}, { locale }),
			});
		}

		if (mall.status !== 'SUSPENDED') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_malls_reactivate_only_suspended({}, { locale }),
			});
		}

		const readiness = getMallActivationReadiness({
			name: mall.name,
			city: mall.city,
			address: mall.address,
			adminCcUserId: mall.adminCcUserId,
		});

		if (!readiness.isReady) {
			const missingRequirementLabels = readiness.missingRequirements.map(
				(code) => getActivationRequirementLabel(code),
			);

			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_malls_reactivate_blocked_missing_requirements(
					{
						requirements: missingRequirementLabels.join(', '),
					},
					{ locale },
				),
			});
		}

		const normalizedReason = input.reason?.trim() || null;
		const updatedMall = await prisma.mall.update({
			where: {
				id: mall.id,
			},
			data: {
				status: 'ACTIVE',
			},
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				description: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				adminCcUserId: true,
				adminCcUser: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminMalls.reactivate',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MALL_REACTIVATED,
			targetType: 'Mall',
			targetId: updatedMall.id,
			metadata: {
				previousStatus: mall.status,
				nextStatus: updatedMall.status,
				reason: normalizedReason,
			},
		});

		notifyMallStatusChange({
			mallId: updatedMall.id,
			mallName: updatedMall.name,
			nextStatus: updatedMall.status,
			reason: normalizedReason,
			adminCcUser: updatedMall.adminCcUser
				? {
						email: updatedMall.adminCcUser.email,
						name: updatedMall.adminCcUser.name,
					}
				: null,
			changedByName: ctx.user.name,
		});

		return { mall: updatedMall };
	});
