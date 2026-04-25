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

const reactivateStoreInputSchema = z.object({
	storeId: z.string().trim().min(1),
	reason: z.string().trim().max(500).optional(),
});

export const reactivateStoreMutation = procedures.adminPlatform
	.input(reactivateStoreInputSchema)
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
			},
		});

		if (!store) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_stores_not_found({}, { locale }),
			});
		}

		if (store.status !== 'SUSPENDED') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_stores_reactivate_only_suspended({}, { locale }),
			});
		}

		const normalizedReason = input.reason?.trim() || null;
		const updatedStore = await prisma.store.update({
			where: {
				id: store.id,
			},
			data: {
				status: 'ACTIVE',
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
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminStores.reactivate',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_STORE_REACTIVATED,
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
				activePlan: null,
			},
		};
	});
