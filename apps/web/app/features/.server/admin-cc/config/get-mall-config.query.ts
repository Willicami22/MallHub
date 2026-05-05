import {
	getDefaultMallId,
	getMallConfig,
} from '@/features/.server/mock-db/admin-cc.mock';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getMallConfigQuery = procedures.adminCc.query(async ({ ctx }) => {
	// Get mall ID from user context or use default
	const mallId = ctx.user?.preferredMallId ?? getDefaultMallId();

	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const config = getMallConfig(mallId);

	if (!config) {
		throw new Error(`Mall ${mallId} not found`);
	}

	return config;
});
