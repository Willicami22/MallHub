import type {
	BillingPaymentMethod,
	BillingPlanCode,
	BillingSubscriptionStatus,
	BillingTargetType,
} from '@/features/.server/prisma/generated/client';
import * as m from '@/paraglide/messages.js';

export const getBillingTargetTypeLabel = (
	targetType: BillingTargetType,
): string =>
	targetType === 'MALL'
		? m.admin_billing_target_mall()
		: m.admin_billing_target_store();

export const getBillingPlanLabel = (planCode: BillingPlanCode): string => {
	if (planCode === 'PREMIUM') {
		return m.admin_billing_plan_premium();
	}

	if (planCode === 'STANDARD') {
		return m.admin_billing_plan_standard();
	}

	return m.admin_billing_plan_basic();
};

export const getBillingStatusLabel = (
	status: BillingSubscriptionStatus,
): string => {
	if (status === 'OVERDUE') {
		return m.admin_billing_status_overdue();
	}

	if (status === 'SUSPENDED') {
		return m.admin_billing_status_suspended();
	}

	return m.admin_billing_status_active();
};

export const formatBillingDate = (value: string | Date | null): string => {
	if (!value) {
		return m.admin_billing_date_not_available();
	}

	return new Date(value).toLocaleDateString();
};

export const getBillingPaymentMethodLabel = (
	paymentMethod: BillingPaymentMethod,
): string => {
	if (paymentMethod === 'CASH') {
		return m.admin_billing_payment_method_cash();
	}

	if (paymentMethod === 'CREDIT_CARD') {
		return m.admin_billing_payment_method_credit_card();
	}

	if (paymentMethod === 'DEBIT_CARD') {
		return m.admin_billing_payment_method_debit_card();
	}

	if (paymentMethod === 'OTHER') {
		return m.admin_billing_payment_method_other();
	}

	return m.admin_billing_payment_method_bank_transfer();
};
