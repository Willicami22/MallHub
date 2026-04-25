import { Badge } from '@mallhub/ui';
import {
	getModerationReportStatusLabel,
	type ModerationReportStatus,
} from '@/features/admin-platform/moderation/components/moderation-report-status-label.lib';

interface ModerationReportStatusBadgeProps {
	status: ModerationReportStatus;
}

const STATUS_VARIANTS: Record<
	ModerationReportStatus,
	'default' | 'secondary' | 'destructive'
> = {
	OPEN: 'destructive',
	RESOLVED: 'default',
	DISMISSED: 'secondary',
};

export function ModerationReportStatusBadge({
	status,
}: ModerationReportStatusBadgeProps) {
	return (
		<Badge variant={STATUS_VARIANTS[status]}>
			{getModerationReportStatusLabel(status)}
		</Badge>
	);
}
