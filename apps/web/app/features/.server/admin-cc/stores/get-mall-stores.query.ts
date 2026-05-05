import {
	getDefaultMallId,
	getStoresByMallId,
} from '@/features/.server/mock-db/admin-cc.mock';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getMallStoresQuery = procedures.adminCc.query(async ({ ctx }) => {
	// Get mall ID from user context or use default
	const mallId = ctx.user?.preferredMallId ?? getDefaultMallId();

	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	// Fetch stores from mock-db
	const stores = getStoresByMallId(mallId);

	return stores;
});
