import { Badge } from '@mallhub/ui';
import type { CampaignStatus } from '@/features/.server/prisma/generated/client';
import { getCampaignStatusLabel } from '@/features/admin-platform/campaigns/components/campaign-labels.lib';

type CampaignStatusBadgeProps = {
	status: CampaignStatus;
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
	const variant =
		status === 'ACTIVE'
			? 'secondary'
			: status === 'PAUSED'
				? 'outline'
				: status === 'EXPIRED'
					? 'destructive'
					: 'outline';

	return <Badge variant={variant}>{getCampaignStatusLabel(status)}</Badge>;
}
