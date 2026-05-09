import { ViewIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import type { Reservation } from '@/features/store-admin-local/shared/types/domain.models';

const statusCopy: Record<Reservation['status'], string> = {
	pending: 'Pendiente',
	confirmed: 'Confirmada',
	rejected: 'Rechazada',
	canceled: 'Cancelada',
	completed: 'Completada',
};

const statusColors: Record<Reservation['status'], string> = {
	pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
	confirmed: 'bg-blue-500/10 text-blue-600 border-blue-200',
	completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
	rejected: 'bg-red-500/10 text-red-600 border-red-200',
	canceled: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

type ReservationsListProps = {
	reservations: Reservation[];
	onConfirm: (id: string) => void;
	onReject: (id: string) => void;
	onComplete: (id: string) => void;
	onViewDetails: (reservation: Reservation) => void;
	busyId: string | null;
};

export function ReservationsList({
	reservations,
	onConfirm,
	onReject,
	onComplete,
	onViewDetails,
	busyId,
}: ReservationsListProps) {
	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Reserva</TableHead>
						<TableHead>Producto</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reservations.map((reservation) => {
						const isBusy = busyId === reservation.id;

						return (
							<TableRow key={reservation.id}>
								<TableCell>
									<div className="flex flex-col">
										<span className="font-medium">
											{reservation.customerName}
										</span>
										<span className="text-xs text-muted-foreground">
											{new Date(reservation.requestedAt).toLocaleString()}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col">
										<span className="font-medium">
											{reservation.productName}
										</span>
										<span className="text-xs text-muted-foreground">
											Cant: {reservation.quantity}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={statusColors[reservation.status]}
									>
										{statusCopy[reservation.status]}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<div className="flex flex-wrap justify-end gap-1">
										<Button
											type="button"
											size="sm"
											variant="ghost"
											onClick={() => onViewDetails(reservation)}
											disabled={isBusy}
										>
											<HugeiconsIcon icon={ViewIcon} className="size-4" />
											<span className="sr-only">Detalles</span>
										</Button>

										{reservation.status === 'pending' ? (
											<>
												<Button
													type="button"
													size="sm"
													disabled={isBusy}
													onClick={() => onConfirm(reservation.id)}
												>
													Confirmar
												</Button>
												<Button
													type="button"
													size="sm"
													variant="outline"
													disabled={isBusy}
													onClick={() => onReject(reservation.id)}
												>
													Rechazar
												</Button>
											</>
										) : null}
										{reservation.status === 'confirmed' ? (
											<>
												<Button
													type="button"
													size="sm"
													disabled={isBusy}
													onClick={() => onComplete(reservation.id)}
												>
													Completar
												</Button>
												<Button
													type="button"
													size="sm"
													variant="outline"
													disabled={isBusy}
													onClick={() => onReject(reservation.id)}
												>
													Rechazar
												</Button>
											</>
										) : null}
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
