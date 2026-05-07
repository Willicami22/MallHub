import { Button, Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import { Link } from 'react-router';
import { ReservationSuccessPulseAtom } from '@/features/reservations/atoms/reservation-success-pulse.atom';
import { ReservationQrCodeMolecule } from '@/features/reservations/molecules/reservation-qr-code.molecule';

export function ReservationStepThreeSummaryOrganism({
	successTitle,
	successDescription,
	summaryTitle,
	qrTitle,
	qrValue,
	storeLabel,
	floorLabel,
	productLabel,
	variantLabel,
	quantityLabel,
	estimatedPickupLabel,
	storeValue,
	floorValue,
	productValue,
	variantValue,
	quantityValue,
	estimatedPickupValue,
	viewReservationsLabel,
	continueExploringLabel,
	addToCalendarLabel,
	viewReservationsHref,
	continueExploringHref,
	onAddToCalendar,
}: {
	successTitle: string;
	successDescription: string;
	summaryTitle: string;
	qrTitle: string;
	qrValue: string;
	storeLabel: string;
	floorLabel: string;
	productLabel: string;
	variantLabel: string;
	quantityLabel: string;
	estimatedPickupLabel: string;
	storeValue: string;
	floorValue: string;
	productValue: string;
	variantValue: string;
	quantityValue: string;
	estimatedPickupValue: string;
	viewReservationsLabel: string;
	continueExploringLabel: string;
	addToCalendarLabel: string;
	viewReservationsHref: string;
	continueExploringHref: string;
	onAddToCalendar: () => void;
}) {
	return (
		<div className="space-y-6">
			<div className="flex flex-col items-center gap-3 text-center">
				<ReservationSuccessPulseAtom />
				<div>
					<h2 className="text-xl font-semibold text-foreground">
						{successTitle}
					</h2>
					<p className="text-sm text-muted-foreground">{successDescription}</p>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">{qrTitle}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex justify-center">
						<ReservationQrCodeMolecule value={qrValue} />
					</div>
					<p className="break-all text-center font-mono text-xs text-muted-foreground">
						{qrValue}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">{summaryTitle}</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="space-y-2 text-sm">
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{storeLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{storeValue}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{floorLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{floorValue}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{productLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{productValue}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{variantLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{variantValue}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{quantityLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{quantityValue}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{estimatedPickupLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{estimatedPickupValue}
							</dd>
						</div>
					</dl>
				</CardContent>
			</Card>

			<div className="grid gap-3 sm:grid-cols-2">
				<Button
					nativeButton={false}
					render={<Link to={viewReservationsHref} />}
					className="w-full"
				>
					{viewReservationsLabel}
				</Button>
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link to={continueExploringHref} />}
					className="w-full"
				>
					{continueExploringLabel}
				</Button>
				<Button
					type="button"
					variant="secondary"
					className="w-full sm:col-span-2"
					onClick={onAddToCalendar}
				>
					{addToCalendarLabel}
				</Button>
			</div>
		</div>
	);
}
