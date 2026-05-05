import { z } from 'zod';
import {
	getDefaultMallId,
	updateMallConfig,
} from '@/features/.server/mock-db/admin-cc.mock';
import { procedures } from '@/features/.server/trpc/trpc.init';

const updateMallConfigInput = z.object({
	name: z.string().min(1, 'Requerido'),
	description: z.string().optional(),
	address: z.string().min(1, 'Requerido'),
	hours: z.array(
		z.object({
			day: z.string(),
			open: z.string(),
			close: z.string(),
		}),
	),
	categories: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
		}),
	),
	logoUrl: z.string().optional(),
	bannerUrl: z.string().optional(),
	mapSvgUrl: z.string().optional(),
});

export const updateMallConfigMutation = procedures.adminCc
	.input(updateMallConfigInput)
	.mutation(async ({ ctx, input }) => {
		// Get mall ID from user context or use default
		const mallId = ctx.user?.preferredMallId ?? getDefaultMallId();

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		// Update in mock-db and return persisted config
		const updated = updateMallConfig(mallId, input);

		return {
			success: true,
			data: updated,
		};
	});
