import { Badge } from '@mallhub/ui';
import type { MallStatus } from '@/features/.server/prisma/generated/client';
import { getMallStatusLabel } from '@/features/admin-platform/malls/components/mall-status-label.lib';

type MallStatusBadgeProps = {
	status: MallStatus;
};

const getMallStatusVariant = (
	status: MallStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' => {
	if (status === 'ACTIVE') {
		return 'default';
	}

	if (status === 'SUSPENDED') {
		return 'destructive';
	}

	return 'outline';
};

export function MallStatusBadge({ status }: MallStatusBadgeProps) {
	return (
		<Badge variant={getMallStatusVariant(status)}>
			{getMallStatusLabel(status)}
		</Badge>
	);
}
