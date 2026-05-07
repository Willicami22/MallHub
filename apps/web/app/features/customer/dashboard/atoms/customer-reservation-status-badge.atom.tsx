import { Badge } from '@mallhub/ui';
import type { ReservationStatus } from '@/features/.server/prisma/generated/enums';
import * as m from '@/paraglide/messages.js';

const RESERVATION_STATUS_BADGE: Record<
	ReservationStatus,
	{ variant: 'default' | 'secondary' | 'outline'; label: () => string }
> = {
	PENDING: {
		variant: 'secondary',
		label: () => m.customer_dashboard_reservation_status_pending(),
	},
	CONFIRMED: {
		variant: 'default',
		label: () => m.customer_dashboard_reservation_status_confirmed(),
	},
	COMPLETED: {
		variant: 'outline',
		label: () => m.customer_dashboard_reservation_status_completed(),
	},
	CANCELED: {
		variant: 'outline',
		label: () => m.customer_dashboard_reservation_status_canceled(),
	},
	REJECTED: {
		variant: 'outline',
		label: () => m.customer_dashboard_reservation_status_canceled(),
	},
};

export function CustomerReservationStatusBadgeAtom({
	status,
}: {
	status: ReservationStatus;
}) {
	const statusInfo = RESERVATION_STATUS_BADGE[status];

	return <Badge variant={statusInfo.variant}>{statusInfo.label()}</Badge>;
}
