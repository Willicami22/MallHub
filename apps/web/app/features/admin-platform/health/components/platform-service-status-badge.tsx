import { Badge } from '@mallhub/ui';
import {
	getPlatformServiceStatusLabel,
	type PlatformServiceStatus,
} from '@/features/admin-platform/health/components/platform-health-labels.lib';

type PlatformServiceStatusBadgeProps = {
	status: PlatformServiceStatus;
};

const STATUS_VARIANTS: Record<
	PlatformServiceStatus,
	'default' | 'secondary' | 'destructive'
> = {
	OPERATIONAL: 'default',
	DEGRADED: 'secondary',
	INCIDENT: 'destructive',
};

export function PlatformServiceStatusBadge({
	status,
}: PlatformServiceStatusBadgeProps) {
	return (
		<Badge variant={STATUS_VARIANTS[status]}>
			{getPlatformServiceStatusLabel(status)}
		</Badge>
	);
}
