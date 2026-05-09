import { Notification01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	toast,
} from '@mallhub/ui';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { RejectReservationDialog } from '@/features/store-admin-local/reservations/components/reject-reservation-dialog';
import { ReservationDetailSheet } from '@/features/store-admin-local/reservations/components/reservation-detail-sheet';
import {
	ReservationsFilterBar,
	type ReservationsFilters,
} from '@/features/store-admin-local/reservations/components/reservations-filter-bar';
import { ReservationsList } from '@/features/store-admin-local/reservations/components/reservations-list';
import { useReservations } from '@/features/store-admin-local/reservations/hooks/use-reservations';
import {
	ListEmptyState,
	ResourceBoundary,
	TableSkeletonRows,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import type { Reservation } from '@/features/store-admin-local/shared/types/domain.models';
import type { Route } from './+types/store-reservations.route';

export const meta = () => [
	{ title: 'Reservas' },
	{ name: 'description', content: 'Gestión de reservas de la tienda.' },
];

export default function StoreReservationsRoute(_props: Route.ComponentProps) {
	const { storeId: activeStoreId } = useOutletContext<{ storeId: string }>();

	const [filters, setFilters] = useState<ReservationsFilters>({
		status: [],
		dateFrom: '',
		dateTo: '',
	});

	const [selectedReservation, setSelectedReservation] =
		useState<Reservation | null>(null);
	const [rejectId, setRejectId] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	// Polling state
	const [lastKnownPendingCount, setLastKnownPendingCount] = useState<
		number | null
	>(null);
	const [showNewReservationAlert, setShowNewReservationAlert] = useState(false);

	const { listQuery, pendingCountQuery, transitionMutation } = useReservations(
		activeStoreId,
		filters,
	);

	// Detect new pending reservations
	useEffect(() => {
		if (pendingCountQuery.data) {
			const currentCount = pendingCountQuery.data.count;
			if (
				lastKnownPendingCount !== null &&
				currentCount > lastKnownPendingCount
			) {
				setShowNewReservationAlert(true);
			}
			setLastKnownPendingCount(currentCount);
		}
	}, [pendingCountQuery.data, lastKnownPendingCount]);

	const errorMessage =
		listQuery.error?.message ?? 'Error al cargar las reservas';

	const rows = listQuery.data?.reservations ?? [];
	const filteredRowsCount = rows.length;
	const hasActiveFilters =
		filters.status.length > 0 || filters.dateFrom || filters.dateTo;

	const handleRefresh = async () => {
		setShowNewReservationAlert(false);
		await listQuery.refetch();
	};

	const runTransition = async (
		reservationId: string,
		next: 'confirmed' | 'rejected' | 'completed',
		reason?: string,
	) => {
		if (!activeStoreId) return;

		setBusyId(reservationId);
		try {
			await transitionMutation.mutateAsync({
				reservationId,
				next,
				storeId: activeStoreId,
				reason,
			});
			toast.success('Reserva actualizada');
			if (next === 'rejected') {
				setRejectId(null);
			}
			await listQuery.refetch();
			if (next === 'confirmed' || next === 'rejected') {
				await pendingCountQuery.refetch();
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'No se pudo actualizar',
			);
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Reservas</h1>
			</div>

			{showNewReservationAlert && (
				<Alert className="border-primary/50 bg-primary/5">
					<HugeiconsIcon
						icon={Notification01Icon}
						className="size-4 text-primary"
					/>
					<AlertTitle className="text-primary">
						Nueva reserva recibida
					</AlertTitle>
					<AlertDescription className="flex items-center justify-between">
						<span>Tienes nuevas reservas pendientes de atención.</span>
						<Button size="sm" onClick={handleRefresh}>
							<HugeiconsIcon icon={RefreshIcon} className="mr-2 size-4" />
							Actualizar lista
						</Button>
					</AlertDescription>
				</Alert>
			)}

			<ReservationsFilterBar filters={filters} onChange={setFilters} />

			<ResourceBoundary
				isLoading={listQuery.isLoading}
				isError={listQuery.isError}
				errorMessage={errorMessage}
				isEmpty={!activeStoreId}
				onRetry={() => {
					listQuery.refetch();
				}}
				loadingFallback={<TableSkeletonRows rows={4} />}
				empty={
					<ListEmptyState
						title="Sin contexto de tienda"
						description="Selecciona una tienda activa para ver reservas."
					/>
				}
			>
				{filteredRowsCount === 0 ? (
					<ListEmptyState
						title={hasActiveFilters ? 'No hay coincidencias' : 'Sin reservas'}
						description={
							hasActiveFilters
								? 'No se encontraron reservas con los filtros actuales.'
								: 'No tienes ninguna reserva todavía.'
						}
					/>
				) : (
					<ReservationsList
						reservations={rows}
						busyId={busyId}
						onConfirm={(id) => runTransition(id, 'confirmed')}
						onReject={(id) => setRejectId(id)}
						onComplete={(id) => runTransition(id, 'completed')}
						onViewDetails={setSelectedReservation}
					/>
				)}
			</ResourceBoundary>

			<ReservationDetailSheet
				reservation={selectedReservation}
				open={!!selectedReservation}
				onOpenChange={(open) => {
					if (!open) setSelectedReservation(null);
				}}
			/>

			<RejectReservationDialog
				open={!!rejectId}
				onOpenChange={(open) => {
					if (!open) setRejectId(null);
				}}
				isBusy={transitionMutation.isPending && busyId === rejectId}
				onConfirm={(reason) => {
					if (rejectId) runTransition(rejectId, 'rejected', reason);
				}}
			/>
		</div>
	);
}
