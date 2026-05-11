import type { BillingPlanCode } from '@/features/.server/prisma/generated/client';

const BILLING_PLAN_CYCLE_DAYS: Record<BillingPlanCode, number> = {
	BASIC: 30,
	STANDARD: 30,
	PREMIUM: 30,
};

export const getBillingPlanCycleDays = (planCode: BillingPlanCode): number =>
	BILLING_PLAN_CYCLE_DAYS[planCode];

export const addDays = (date: Date, days: number): Date => {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
};

export const addBillingPlanCycle = (
	date: Date,
	planCode: BillingPlanCode,
): Date => addDays(date, getBillingPlanCycleDays(planCode));
