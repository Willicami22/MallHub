import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';

export function useReservations(
	storeId: string | null,
	filters?: { status?: string[]; dateFrom?: string; dateTo?: string },
) {
	const trpc = useTRPC();

	const listQuery = useQuery({
		...trpc.storeAdminLocal.listStoreReservations.queryOptions({
			storeId: storeId ?? '',
			status: filters?.status,
			dateFrom: filters?.dateFrom,
			dateTo: filters?.dateTo,
		}),
		enabled: !!storeId,
	});

	const pendingCountQuery = useQuery({
		...trpc.storeAdminLocal.getPendingReservationsCount.queryOptions({
			storeId: storeId ?? '',
		}),
		enabled: !!storeId,
		refetchInterval: 30_000, // Poll every 30s
	});

	const transitionMutation = useMutation(
		trpc.storeAdminLocal.transitionReservation.mutationOptions(),
	);

	return { listQuery, pendingCountQuery, transitionMutation };
}
