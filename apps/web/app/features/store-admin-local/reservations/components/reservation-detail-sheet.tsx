import {
	CheckmarkCircle01Icon,
	Clock01Icon,
	Mail01Icon,
	Message01Icon,
	ShoppingBag01Icon,
	TelephoneIcon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	ScrollArea,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@mallhub/ui';
import type { Reservation } from '@/features/store-admin-local/shared/types/domain.models';

type ReservationDetailSheetProps = {
	reservation: Reservation | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const statusConfig: Record<Reservation['status'], string> = {
	pending:
		'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
	confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
	rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
	completed:
		'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
	canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500',
};

const statusLabels: Record<Reservation['status'], string> = {
	pending: 'Pendiente',
	confirmed: 'Confirmada',
	completed: 'Completada',
	rejected: 'Rechazada',
	canceled: 'Cancelada',
};

export function ReservationDetailSheet({
	reservation,
	open,
	onOpenChange,
}: ReservationDetailSheetProps) {
	if (!reservation) return null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex w-full flex-col sm:max-w-md">
				<SheetHeader className="px-1 text-left">
					<SheetTitle className="flex items-center justify-between">
						<span>Detalle de Reserva</span>
						<Badge
							variant="outline"
							className={statusConfig[reservation.status]}
						>
							{statusLabels[reservation.status]}
						</Badge>
					</SheetTitle>
					<SheetDescription>ID: {reservation.id}</SheetDescription>
				</SheetHeader>

				<ScrollArea className="flex-1 px-1 py-4">
					<div className="space-y-6">
						{/* Cliente */}
						<section className="space-y-3">
							<h3 className="text-sm font-medium text-muted-foreground">
								Información del Cliente
							</h3>
							<div className="rounded-xl border p-4 shadow-sm">
								<div className="flex flex-col gap-3 text-sm">
									<div className="flex items-center gap-3">
										<HugeiconsIcon
											icon={UserIcon}
											className="size-4 text-muted-foreground"
										/>
										<span className="font-medium">
											{reservation.customerName}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<HugeiconsIcon
											icon={TelephoneIcon}
											className="size-4 text-muted-foreground"
										/>
										<span>{reservation.pickupPhone || 'No proporcionado'}</span>
									</div>
									<div className="flex items-center gap-3">
										<HugeiconsIcon
											icon={Mail01Icon}
											className="size-4 text-muted-foreground"
										/>
										<span>{reservation.customerEmail}</span>
									</div>
									{reservation.notes && (
										<div className="mt-2 rounded-lg bg-muted p-3 text-sm italic">
											<HugeiconsIcon
												icon={Message01Icon}
												className="mr-2 inline size-4 align-text-bottom text-muted-foreground"
											/>
											"{reservation.notes}"
										</div>
									)}
								</div>
							</div>
						</section>

						{/* Producto */}
						<section className="space-y-3">
							<h3 className="text-sm font-medium text-muted-foreground">
								Información del Producto
							</h3>
							<div className="rounded-xl border p-4 shadow-sm">
								<div className="flex flex-col gap-3 text-sm">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<HugeiconsIcon
												icon={ShoppingBag01Icon}
												className="size-4 text-muted-foreground"
											/>
											<span className="font-medium">
												{reservation.productName}
											</span>
										</div>
										<span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
											x{reservation.quantity}
										</span>
									</div>
									<div className="flex items-center gap-3 text-muted-foreground">
										<span className="text-xs">ID: {reservation.productId}</span>
									</div>
								</div>
							</div>
						</section>

						{/* Tiempos */}
						<section className="space-y-3">
							<h3 className="text-sm font-medium text-muted-foreground">
								Línea de tiempo
							</h3>
							<div className="rounded-xl border p-4 shadow-sm">
								<div className="flex flex-col gap-4 text-sm">
									<div className="flex gap-4">
										<div className="mt-0.5 flex flex-col items-center">
											<div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
												<HugeiconsIcon icon={Clock01Icon} className="size-3" />
											</div>
											<div className="my-1 h-full w-px bg-border" />
										</div>
										<div className="pb-4">
											<p className="font-medium">Solicitada</p>
											<p className="text-muted-foreground">
												{new Date(reservation.requestedAt).toLocaleString()}
											</p>
										</div>
									</div>

									{reservation.confirmedAt && (
										<div className="flex gap-4">
											<div className="mt-0.5 flex flex-col items-center">
												<div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
													<HugeiconsIcon
														icon={CheckmarkCircle01Icon}
														className="size-3"
													/>
												</div>
												{reservation.completedAt && (
													<div className="my-1 h-full w-px bg-border" />
												)}
											</div>
											<div className={reservation.completedAt ? 'pb-4' : ''}>
												<p className="font-medium">Confirmada</p>
												<p className="text-muted-foreground">
													{new Date(reservation.confirmedAt).toLocaleString()}
												</p>
											</div>
										</div>
									)}

									{reservation.completedAt && (
										<div className="flex gap-4">
											<div className="mt-0.5 flex flex-col items-center">
												<div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
													<HugeiconsIcon
														icon={CheckmarkCircle01Icon}
														className="size-3"
													/>
												</div>
											</div>
											<div>
												<p className="font-medium">Completada</p>
												<p className="text-muted-foreground">
													{new Date(reservation.completedAt).toLocaleString()}
												</p>
											</div>
										</div>
									)}

									{reservation.canceledAt && (
										<div className="flex gap-4">
											<div className="mt-0.5 flex flex-col items-center">
												<div className="flex size-6 items-center justify-center rounded-full bg-red-500/10 text-red-500">
													<HugeiconsIcon
														icon={CheckmarkCircle01Icon}
														className="size-3"
													/>
												</div>
											</div>
											<div>
												<p className="font-medium text-red-600">Rechazada</p>
												<p className="text-muted-foreground">
													{new Date(reservation.canceledAt).toLocaleString()}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</section>

						{/* Razón de rechazo */}
						{reservation.status === 'rejected' && reservation.statusReason && (
							<section className="space-y-3">
								<h3 className="text-sm font-medium text-red-600">
									Motivo del rechazo
								</h3>
								<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/20 dark:text-red-300">
									{reservation.statusReason}
								</div>
							</section>
						)}
					</div>
				</ScrollArea>

				<div className="mt-auto flex justify-end border-t pt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cerrar
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
