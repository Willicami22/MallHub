import { Badge } from '@mallhub/ui';
import type { BillingSubscriptionStatus } from '@/features/.server/prisma/generated/client';
import { getBillingStatusLabel } from '@/features/admin-platform/billing/components/billing-labels.lib';

type BillingSubscriptionStatusBadgeProps = {
	status: BillingSubscriptionStatus;
};

export function BillingSubscriptionStatusBadge({
	status,
}: BillingSubscriptionStatusBadgeProps) {
	const variant =
		status === 'ACTIVE'
			? 'secondary'
			: status === 'OVERDUE'
				? 'destructive'
				: 'outline';

	return <Badge variant={variant}>{getBillingStatusLabel(status)}</Badge>;
}
