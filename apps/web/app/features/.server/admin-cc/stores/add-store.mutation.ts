import { z } from 'zod';
import {
	addStore,
	getDefaultMallId,
	StoreStatusEnum,
} from '@/features/.server/mock-db/admin-cc.mock';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const addStoreMutation = procedures.adminCc
	.input(
		z.object({
			name: z.string().min(1, 'Nombre requerido'),
			category: z.string().min(1, 'Categoría requerida'),
			contactEmail: z.string().email('Email inválido'),
			status: StoreStatusEnum.optional().default('PENDING'),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		// Get mall ID from user context or use default
		const mallId = ctx.user?.preferredMallId ?? getDefaultMallId();

		// Add store to mock-db
		const newStore = addStore(mallId, {
			name: input.name,
			category: input.category,
			contactEmail: input.contactEmail,
			status: input.status,
		});

		return {
			success: true,
			data: newStore,
		};
	});
