import { Badge } from '@mallhub/ui';
import {
	getPlatformHealthIncidentStatusLabel,
	type PlatformHealthIncidentStatus,
} from '@/features/admin-platform/health/components/platform-health-labels.lib';

type PlatformHealthIncidentStatusBadgeProps = {
	status: PlatformHealthIncidentStatus;
};

const STATUS_VARIANTS: Record<
	PlatformHealthIncidentStatus,
	'default' | 'destructive'
> = {
	OPEN: 'destructive',
	RESOLVED: 'default',
};

export function PlatformHealthIncidentStatusBadge({
	status,
}: PlatformHealthIncidentStatusBadgeProps) {
	return (
		<Badge variant={STATUS_VARIANTS[status]}>
			{getPlatformHealthIncidentStatusLabel(status)}
		</Badge>
	);
}
