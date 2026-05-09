import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';

export function useDashboardMetrics(
	storeId: string | null,
	period: '30d' | '90d' = '30d',
) {
	const trpc = useTRPC();

	return useQuery(
		trpc.storeAdminLocal.getDashboardMetrics.queryOptions({
			storeId: storeId ?? '',
			period,
		}),
	);
}
