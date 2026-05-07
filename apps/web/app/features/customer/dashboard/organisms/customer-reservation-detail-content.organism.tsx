import { Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import type { ReservationStatus } from '@/features/.server/prisma/generated/enums';
import { CustomerReservationStatusBadgeAtom } from '@/features/customer/dashboard/atoms/customer-reservation-status-badge.atom';
import { CustomerReservationDetailQrMolecule } from '@/features/customer/dashboard/molecules/customer-reservation-detail-qr.molecule';

const ACTIVE_STATUSES = new Set<ReservationStatus>(['PENDING', 'CONFIRMED']);
const CANCELED_STATUSES = new Set<ReservationStatus>(['CANCELED', 'REJECTED']);

export function CustomerReservationDetailContentOrganism({
	reservation,
	qrTitle,
	storeLabel,
	floorLabel,
	productLabel,
	quantityLabel,
	requestedAtLabel,
	cancelReasonLabel,
	emptyReasonLabel,
}: {
	reservation: {
		id: string;
		status: ReservationStatus;
		qrCodeValue: string;
		quantity: number;
		requestedAt: string;
		statusReason: string | null;
		storeName: string;
		storeFloor: string | null;
		productName: string;
	};
	qrTitle: string;
	storeLabel: string;
	floorLabel: string;
	productLabel: string;
	quantityLabel: string;
	requestedAtLabel: (value: string) => string;
	cancelReasonLabel: string;
	emptyReasonLabel: string;
}) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between gap-3">
						<CardTitle className="text-base">
							{reservation.productName}
						</CardTitle>
						<CustomerReservationStatusBadgeAtom status={reservation.status} />
					</div>
				</CardHeader>
				<CardContent>
					<dl className="space-y-2 text-sm">
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{storeLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{reservation.storeName}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{floorLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{reservation.storeFloor ?? '—'}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{productLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{reservation.productName}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">{quantityLabel}</dt>
							<dd className="text-right font-medium text-foreground">
								{reservation.quantity}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted-foreground">
								{requestedAtLabel(reservation.requestedAt)}
							</dt>
							<dd />
						</div>
					</dl>
				</CardContent>
			</Card>

			{ACTIVE_STATUSES.has(reservation.status) && (
				<CustomerReservationDetailQrMolecule
					title={qrTitle}
					qrValue={reservation.qrCodeValue}
				/>
			)}

			{CANCELED_STATUSES.has(reservation.status) && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{cancelReasonLabel}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{reservation.statusReason?.trim() || emptyReasonLabel}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
