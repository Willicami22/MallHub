import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/features/store-admin-local/store-dashboard/services/dashboard.service';

const metricsKey = (storeId: string) =>
	['store-admin', 'dashboard-metrics', storeId] as const;

export function useDashboardMetrics(storeId: string | null) {
	return useQuery({
		queryKey: metricsKey(storeId ?? 'none'),
		queryFn: async () => {
			if (!storeId) {
				return null;
			}
			return dashboardService.getMetrics(storeId);
		},
		enabled: Boolean(storeId),
	});
}
