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
	completed: 'Completada',
};

type ReservationsListProps = {
	reservations: Reservation[];
	onConfirm: (id: string) => void;
	onReject: (id: string) => void;
	onComplete: (id: string) => void;
	isBusy: boolean;
};

export function ReservationsList({
	reservations,
	onConfirm,
	onReject,
	onComplete,
	isBusy,
}: ReservationsListProps) {
	return (
		<div className="rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Cliente</TableHead>
						<TableHead>Ventana</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reservations.map((reservation) => (
						<TableRow key={reservation.id}>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">
										{reservation.customerName}
									</span>
									<span className="text-xs text-muted-foreground">
										{reservation.customerEmail}
									</span>
								</div>
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{new Date(reservation.startsAt).toLocaleString()} →{' '}
								{new Date(reservation.endsAt).toLocaleString()}
							</TableCell>
							<TableCell>
								<Badge
									variant={
										reservation.status === 'pending' ? 'secondary' : 'default'
									}
								>
									{statusCopy[reservation.status]}
								</Badge>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex flex-wrap justify-end gap-1">
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
					))}
				</TableBody>
			</Table>
		</div>
	);
}
