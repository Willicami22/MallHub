import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyMallStatusChange } from '@/features/.server/admin-platform/malls/mall-status-notification.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const suspendMallInputSchema = z.object({
	mallId: z.string().trim().min(1),
	reason: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_malls_validation_suspend_reason_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(500),
});

export const suspendMallMutation = procedures.adminPlatform
	.input(suspendMallInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const mall = await prisma.mall.findUnique({
			where: {
				id: input.mallId,
			},
			select: {
				id: true,
				name: true,
				status: true,
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

		if (mall.status === 'SUSPENDED') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_malls_suspend_already_suspended({}, { locale }),
			});
		}

		if (mall.status !== 'ACTIVE') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_malls_suspend_only_active({}, { locale }),
			});
		}

		const updatedMall = await prisma.mall.update({
			where: {
				id: mall.id,
			},
			data: {
				status: 'SUSPENDED',
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
			context: 'trpc.adminMalls.suspend',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_MALL_SUSPENDED,
			targetType: 'Mall',
			targetId: updatedMall.id,
			metadata: {
				previousStatus: mall.status,
				nextStatus: updatedMall.status,
				reason: input.reason,
			},
		});

		notifyMallStatusChange({
			mallId: updatedMall.id,
			mallName: updatedMall.name,
			nextStatus: updatedMall.status,
			reason: input.reason,
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
