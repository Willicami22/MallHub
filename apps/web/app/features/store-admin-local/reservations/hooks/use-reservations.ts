import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '@/features/store-admin-local/reservations/services/reservation.service';
import type { ReservationStatus } from '@/features/store-admin-local/shared/types/domain.models';

const key = (storeId: string) =>
	['store-admin', 'reservations', storeId] as const;

export function useReservations(storeId: string | null) {
	const queryClient = useQueryClient();

	const listQuery = useQuery({
		queryKey: key(storeId ?? 'none'),
		queryFn: async () => {
			if (!storeId) {
				return [];
			}
			return reservationService.listByStore(storeId);
		},
		enabled: Boolean(storeId),
	});

	const transitionMutation = useMutation({
		mutationFn: ({
			reservationId,
			next,
		}: {
			reservationId: string;
			next: ReservationStatus;
			sId: string;
		}) => reservationService.transition(reservationId, next),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: key(variables.sId) });
		},
	});

	return { listQuery, transitionMutation };
}
