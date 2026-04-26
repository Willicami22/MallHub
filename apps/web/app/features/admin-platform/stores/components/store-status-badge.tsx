import { Badge } from '@mallhub/ui';
import type { StoreStatus } from '@/features/.server/prisma/generated/client';
import { getStoreStatusLabel } from '@/features/admin-platform/stores/components/store-status-label.lib';

type StoreStatusBadgeProps = {
	status: StoreStatus;
};

const getStoreStatusVariant = (
	status: StoreStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' => {
	if (status === 'ACTIVE') {
		return 'default';
	}

	if (status === 'SUSPENDED') {
		return 'destructive';
	}

	if (status === 'PENDING_APPROVAL') {
		return 'secondary';
	}

	return 'outline';
};

export function StoreStatusBadge({ status }: StoreStatusBadgeProps) {
	return (
		<Badge variant={getStoreStatusVariant(status)}>
			{getStoreStatusLabel(status)}
		</Badge>
	);
}
