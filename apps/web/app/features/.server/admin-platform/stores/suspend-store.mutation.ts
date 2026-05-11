import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyStoreStatusChange } from '@/features/.server/admin-platform/stores/store-status-notification.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const suspendStoreInputSchema = z.object({
	storeId: z.string().trim().min(1),
	reason: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_stores_validation_suspend_reason_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(500),
});

export const suspendStoreMutation = procedures.adminPlatform
	.input(suspendStoreInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const store = await prisma.store.findUnique({
			where: {
				id: input.storeId,
			},
			select: {
				id: true,
				name: true,
				status: true,
				mall: {
					select: {
						id: true,
						name: true,
						adminCcUser: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				billingSubscription: {
					select: {
						id: true,
						planCode: true,
						status: true,
						nextPaymentDueAt: true,
					},
				},
			},
		});

		if (!store) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_stores_not_found({}, { locale }),
			});
		}

		if (store.status === 'SUSPENDED') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_stores_suspend_already_suspended({}, { locale }),
			});
		}

		if (store.status !== 'ACTIVE') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_stores_suspend_only_active({}, { locale }),
			});
		}

		const normalizedReason = input.reason.trim();
		const updatedStore = await prisma.store.update({
			where: {
				id: store.id,
			},
			data: {
				status: 'SUSPENDED',
			},
			select: {
				id: true,
				name: true,
				category: true,
				description: true,
				phone: true,
				contactEmail: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				mall: {
					select: {
						id: true,
						name: true,
						city: true,
						status: true,
						adminCcUser: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				billingSubscription: {
					select: {
						id: true,
						planCode: true,
						status: true,
						nextPaymentDueAt: true,
					},
				},
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminStores.suspend',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_STORE_SUSPENDED,
			targetType: 'Store',
			targetId: updatedStore.id,
			metadata: {
				mallId: updatedStore.mall.id,
				previousStatus: store.status,
				nextStatus: updatedStore.status,
				reason: normalizedReason,
			},
		});

		notifyStoreStatusChange({
			storeId: updatedStore.id,
			storeName: updatedStore.name,
			mallName: updatedStore.mall.name,
			nextStatus: updatedStore.status,
			reason: normalizedReason,
			adminLocalUser: updatedStore.owner
				? {
						email: updatedStore.owner.email,
						name: updatedStore.owner.name,
					}
				: null,
			adminCcUser: updatedStore.mall.adminCcUser
				? {
						email: updatedStore.mall.adminCcUser.email,
						name: updatedStore.mall.adminCcUser.name,
					}
				: null,
			changedByName: ctx.user.name,
		});

		return {
			store: {
				...updatedStore,
				activePlan: updatedStore.billingSubscription
					? {
							id: updatedStore.billingSubscription.id,
							planCode: updatedStore.billingSubscription.planCode,
							status: updatedStore.billingSubscription.status,
							nextPaymentDueAt:
								updatedStore.billingSubscription.nextPaymentDueAt,
						}
					: null,
			},
		};
	});
