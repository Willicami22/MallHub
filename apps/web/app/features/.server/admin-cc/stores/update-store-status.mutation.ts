import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	reactivateStore,
	StoreStatusEnum,
	suspendStore,
	updateStoreStatus,
} from '@/features/.server/mock-db/admin-cc.mock';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const updateStoreStatusMutation = procedures.adminCc
	.input(
		z.object({
			storeId: z.string(),
			status: StoreStatusEnum,
		}),
	)
	.mutation(async ({ input }) => {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		try {
			const updated = updateStoreStatus(input.storeId, input.status);

			return {
				success: true,
				storeId: updated.id,
				status: updated.status,
				data: updated,
			};
		} catch (_error) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `Store ${input.storeId} not found`,
			});
		}
	});

export const suspendStoreMutation = procedures.adminCc
	.input(z.object({ storeId: z.string() }))
	.mutation(async ({ input }) => {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		try {
			const updated = suspendStore(input.storeId);

			return {
				success: true,
				storeId: updated.id,
				status: updated.status,
				data: updated,
			};
		} catch (_error) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `Store ${input.storeId} not found`,
			});
		}
	});

export const reactivateStoreMutation = procedures.adminCc
	.input(z.object({ storeId: z.string() }))
	.mutation(async ({ input }) => {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		try {
			const updated = reactivateStore(input.storeId);

			return {
				success: true,
				storeId: updated.id,
				status: updated.status,
				data: updated,
			};
		} catch (_error) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `Store ${input.storeId} not found`,
			});
		}
	});
