import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	Label,
	Textarea,
} from '@mallhub/ui';
import { useState } from 'react';

type RejectReservationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string) => void;
	isBusy: boolean;
};

export function RejectReservationDialog({
	open,
	onOpenChange,
	onConfirm,
	isBusy,
}: RejectReservationDialogProps) {
	const [reason, setReason] = useState('');

	const handleConfirm = (e: React.MouseEvent) => {
		e.preventDefault();
		if (reason.length >= 10) {
			onConfirm(reason);
		}
	};

	const isValid = reason.trim().length >= 10;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Rechazar reserva</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción cancelará la reserva y no se podrá deshacer. Debes
						proporcionar un motivo para que el cliente sepa por qué fue
						rechazada.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="my-4 space-y-2">
					<Label htmlFor="reject-reason">
						Motivo del rechazo <span className="text-destructive">*</span>
					</Label>
					<Textarea
						id="reject-reason"
						placeholder="Ej. No tenemos stock disponible en este momento..."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						disabled={isBusy}
						rows={3}
					/>
					{!isValid && reason.length > 0 && (
						<p className="text-xs text-destructive">
							El motivo debe tener al menos 10 caracteres.
						</p>
					)}
				</div>

				<AlertDialogFooter>
					<Button
						variant="outline"
						disabled={isBusy}
						onClick={() => {
							setReason('');
							onOpenChange(false);
						}}
					>
						Cancelar
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={!isValid || isBusy}
						variant="destructive"
					>
						{isBusy ? 'Rechazando...' : 'Confirmar rechazo'}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
