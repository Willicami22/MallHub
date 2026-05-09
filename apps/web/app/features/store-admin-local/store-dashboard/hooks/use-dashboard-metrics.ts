import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';

const _metricsKey = (storeId: string) =>
	['store-admin', 'dashboard-metrics', storeId] as const;

export function useDashboardMetrics(storeId: string | null) {
	const trpc = useTRPC();

	return useQuery(
		trpc.storeAdminLocal.getDashboardMetrics.queryOptions({
			storeId: storeId ?? '',
		}),
	);
}
