import type {
	BillingSubscriptionStatus,
	Prisma,
} from '@/features/.server/prisma/generated/client';

export const getBillingSubscriptionEffectiveStatus = (
	status: BillingSubscriptionStatus,
	nextPaymentDueAt: Date | null,
	now: Date = new Date(),
): BillingSubscriptionStatus => {
	if (status === 'SUSPENDED') {
		return 'SUSPENDED';
	}

	if (nextPaymentDueAt !== null && nextPaymentDueAt.getTime() < now.getTime()) {
		return 'OVERDUE';
	}

	return 'ACTIVE';
};

export const getBillingStatusFilterWhere = (
	statusFilter: BillingSubscriptionStatus | undefined,
	now: Date = new Date(),
): Prisma.BillingSubscriptionWhereInput | undefined => {
	if (!statusFilter) {
		return undefined;
	}

	if (statusFilter === 'SUSPENDED') {
		return {
			status: 'SUSPENDED',
		};
	}

	if (statusFilter === 'OVERDUE') {
		return {
			status: {
				not: 'SUSPENDED',
			},
			nextPaymentDueAt: {
				lt: now,
			},
		};
	}

	return {
		status: {
			not: 'SUSPENDED',
		},
		OR: [
			{
				nextPaymentDueAt: null,
			},
			{
				nextPaymentDueAt: {
					gte: now,
				},
			},
		],
	};
};
