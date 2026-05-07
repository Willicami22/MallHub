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

export const reactivateStoreMutation = procedures.adminCc
	.input(z.object({ storeId: z.string().trim().min(1) }))
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const store = await prisma.store.findUnique({
			where: { id: input.storeId },
			select: {
				id: true,
				name: true,
				status: true,
				mall: {
					select: {
						id: true,
						name: true,
						adminCcUser: {
							select: { id: true, name: true, email: true },
						},
					},
				},
				owner: {
					select: { id: true, name: true, email: true },
				},
			},
		});

		if (!store) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_cc_stores_not_found({}, { locale }),
			});
		}

		if (store.status !== 'SUSPENDED') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_cc_stores_reactivate_only_suspended({}, { locale }),
			});
		}

		const updatedStore = await prisma.store.update({
			where: { id: store.id },
			data: { status: 'ACTIVE' },
			select: {
				id: true,
				name: true,
				status: true,
				mall: {
					select: {
						id: true,
						name: true,
						adminCcUser: {
							select: { id: true, name: true, email: true },
						},
					},
				},
				owner: {
					select: { id: true, name: true, email: true },
				},
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminCcStores.reactivate',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_STORE_REACTIVATED,
			targetType: 'Store',
			targetId: updatedStore.id,
			metadata: {
				mallId: updatedStore.mall.id,
				previousStatus: store.status,
				nextStatus: updatedStore.status,
			},
		});

		notifyStoreStatusChange({
			storeId: updatedStore.id,
			storeName: updatedStore.name,
			mallName: updatedStore.mall.name,
			nextStatus: updatedStore.status,
			reason: null,
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

		return { store: updatedStore };
	});
