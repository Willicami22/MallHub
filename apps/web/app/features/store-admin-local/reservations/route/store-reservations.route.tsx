import { toast } from '@mallhub/ui';
import { useOutletContext } from 'react-router';
import { ReservationsList } from '@/features/store-admin-local/reservations/components/reservations-list';
import { useReservations } from '@/features/store-admin-local/reservations/hooks/use-reservations';
import {
	ListEmptyState,
	ResourceBoundary,
	TableSkeletonRows,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import type { Route } from './+types/store-reservations.route';

export const meta = () => [
	{ title: 'Reservas' },
	{ name: 'description', content: 'Gestión de reservas de la tienda.' },
];

export default function StoreReservationsRoute(_props: Route.ComponentProps) {
	const { storeId: activeStoreId } = useOutletContext<{ storeId: string }>();
	const { listQuery, transitionMutation } = useReservations(activeStoreId);

	const errorMessage =
		listQuery.error && isServiceError(listQuery.error)
			? listQuery.error.message
			: (listQuery.error?.message ?? null);

	const rows = listQuery.data ?? [];

	const runTransition = async (
		reservationId: string,
		next: 'confirmed' | 'rejected' | 'completed',
	) => {
		if (!activeStoreId) {
			return;
		}
		try {
			await transitionMutation.mutateAsync({
				reservationId,
				next,
				sId: activeStoreId,
			});
			toast.success('Reserva actualizada');
		} catch (error) {
			const message =
				error && isServiceError(error)
					? error.message
					: 'No se pudo actualizar la reserva';
			toast.error(message);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Reservas</h1>
				<p className="text-sm text-muted-foreground">
					Acciones con reglas de estado en el servicio (sin efectos encadenados
					ocultos).
				</p>
			</div>

			<ResourceBoundary
				isLoading={listQuery.isLoading}
				isError={listQuery.isError}
				errorMessage={errorMessage}
				isEmpty={!activeStoreId}
				onRetry={() => {
					void listQuery.refetch();
				}}
				loadingFallback={<TableSkeletonRows rows={4} />}
				empty={
					<ListEmptyState
						title="Sin contexto de tienda"
						description="Selecciona una tienda activa para ver reservas."
					/>
				}
			>
				{rows.length === 0 ? (
					<ListEmptyState
						title="Sin reservas"
						description="Cuando lleguen solicitudes aparecerán aquí."
					/>
				) : (
					<ReservationsList
						reservations={rows}
						isBusy={transitionMutation.isPending}
						onConfirm={(id) => {
							void runTransition(id, 'confirmed');
						}}
						onReject={(id) => {
							void runTransition(id, 'rejected');
						}}
						onComplete={(id) => {
							void runTransition(id, 'completed');
						}}
					/>
				)}
			</ResourceBoundary>
		</div>
	);
}
