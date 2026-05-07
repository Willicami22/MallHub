import { Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import { ReservationQrCodeMolecule } from '@/features/reservations/molecules/reservation-qr-code.molecule';

export function CustomerReservationDetailQrMolecule({
	title,
	qrValue,
}: {
	title: string;
	qrValue: string;
}) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center overflow-x-auto rounded-lg border bg-muted/20 p-4">
					<ReservationQrCodeMolecule
						value={qrValue}
						cellClassName="size-4 sm:size-5"
					/>
				</div>
				<p className="break-all text-center font-mono text-xs text-muted-foreground">
					{qrValue}
				</p>
			</CardContent>
		</Card>
	);
}
