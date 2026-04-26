import { createHash } from 'node:crypto';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import type {
	BillingPlanCode,
	BillingSubscriptionStatus,
	BillingTargetType,
} from '@/features/.server/prisma/generated/client';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import * as m from '@/paraglide/messages.js';

export type BillingNotificationRecipient = {
	email: string;
	name: string;
};

type NotifyBillingPlanChangeInput = {
	subscriptionId: string;
	targetType: BillingTargetType;
	targetName: string;
	planCode: BillingPlanCode;
	status: BillingSubscriptionStatus;
	nextPaymentDueAt: Date | null;
	reason?: string | null;
	changedByName?: string | null;
	recipients: BillingNotificationRecipient[];
};

type NotifyCollectionAlertInput = {
	subscriptionId: string;
	targetType: BillingTargetType;
	targetName: string;
	planCode: BillingPlanCode;
	nextPaymentDueAt: Date | null;
	reason?: string | null;
	changedByName?: string | null;
	recipients: BillingNotificationRecipient[];
};

const getPlanLabel = (planCode: BillingPlanCode, locale: Locale): string => {
	if (planCode === 'PREMIUM') {
		return m.admin_billing_plan_premium({}, { locale });
	}

	if (planCode === 'STANDARD') {
		return m.admin_billing_plan_standard({}, { locale });
	}

	return m.admin_billing_plan_basic({}, { locale });
};

const getStatusLabel = (
	status: BillingSubscriptionStatus,
	locale: Locale,
): string => {
	if (status === 'OVERDUE') {
		return m.admin_billing_status_overdue({}, { locale });
	}

	if (status === 'SUSPENDED') {
		return m.admin_billing_status_suspended({}, { locale });
	}

	return m.admin_billing_status_active({}, { locale });
};

const getTargetTypeLabel = (
	targetType: BillingTargetType,
	locale: Locale,
): string =>
	targetType === 'MALL'
		? m.admin_billing_target_mall({}, { locale })
		: m.admin_billing_target_store({}, { locale });

const buildRecipients = (
	recipients: BillingNotificationRecipient[],
): BillingNotificationRecipient[] => {
	const byEmail = new Map<string, BillingNotificationRecipient>();
	for (const recipient of recipients) {
		byEmail.set(recipient.email.toLowerCase(), recipient);
	}

	return Array.from(byEmail.values());
};

const formatDateOrFallback = (date: Date | null, locale: Locale): string => {
	if (!date) {
		return m.admin_billing_date_not_available({}, { locale });
	}

	return new Intl.DateTimeFormat(locale).format(date);
};

const buildPlanChangeIdempotencyKey = (
	subscriptionId: string,
	planCode: BillingPlanCode,
	status: BillingSubscriptionStatus,
	recipientEmail: string,
	reason: string | null,
): string => {
	const digest = createHash('sha256')
		.update(
			`${subscriptionId}:${planCode}:${status}:${recipientEmail}:${reason ?? ''}`,
		)
		.digest('hex');

	return `admin-billing-plan/${digest}`;
};

const buildCollectionAlertIdempotencyKey = (
	subscriptionId: string,
	recipientEmail: string,
	reason: string | null,
): string => {
	const digest = createHash('sha256')
		.update(`${subscriptionId}:${recipientEmail}:${reason ?? ''}`)
		.digest('hex');

	return `admin-billing-collection-alert/${digest}`;
};

export const notifyBillingPlanChange = ({
	subscriptionId,
	targetType,
	targetName,
	planCode,
	status,
	nextPaymentDueAt,
	reason,
	changedByName,
	recipients,
}: NotifyBillingPlanChangeInput): void => {
	const uniqueRecipients = buildRecipients(recipients);
	if (uniqueRecipients.length === 0) {
		return;
	}

	const locale = getLocaleFromAsyncStorage();
	const planLabel = getPlanLabel(planCode, locale);
	const statusLabel = getStatusLabel(status, locale);
	const targetTypeLabel = getTargetTypeLabel(targetType, locale);
	const dueDateLabel = formatDateOrFallback(nextPaymentDueAt, locale);
	const normalizedReason = reason?.trim() || null;
	const actorName = changedByName?.trim().length
		? changedByName
		: m.admin_billing_notification_platform_admin({}, { locale });

	for (const recipient of uniqueRecipients) {
		const baseText = m.admin_billing_notification_plan_text(
			{
				name: recipient.name,
				targetType: targetTypeLabel,
				targetName,
				plan: planLabel,
				status: statusLabel,
				dueDate: dueDateLabel,
				actor: actorName,
			},
			{ locale },
		);
		const reasonLine = normalizedReason
			? `\n${m.admin_billing_notification_reason_line(
					{ reason: normalizedReason },
					{ locale },
				)}`
			: '';

		dispatchNotificationEmail({
			to: recipient.email,
			subject: m.admin_billing_notification_plan_subject(
				{
					targetType: targetTypeLabel,
					targetName,
					plan: planLabel,
				},
				{ locale },
			),
			text: `${baseText}${reasonLine}`,
			idempotencyKey: buildPlanChangeIdempotencyKey(
				subscriptionId,
				planCode,
				status,
				recipient.email,
				normalizedReason,
			),
		});
	}
};

export const notifyBillingCollectionAlert = ({
	subscriptionId,
	targetType,
	targetName,
	planCode,
	nextPaymentDueAt,
	reason,
	changedByName,
	recipients,
}: NotifyCollectionAlertInput): void => {
	const uniqueRecipients = buildRecipients(recipients);
	if (uniqueRecipients.length === 0) {
		return;
	}

	const locale = getLocaleFromAsyncStorage();
	const targetTypeLabel = getTargetTypeLabel(targetType, locale);
	const planLabel = getPlanLabel(planCode, locale);
	const dueDateLabel = formatDateOrFallback(nextPaymentDueAt, locale);
	const normalizedReason = reason?.trim() || null;
	const actorName = changedByName?.trim().length
		? changedByName
		: m.admin_billing_notification_platform_admin({}, { locale });

	for (const recipient of uniqueRecipients) {
		const baseText = m.admin_billing_notification_collection_text(
			{
				name: recipient.name,
				targetType: targetTypeLabel,
				targetName,
				plan: planLabel,
				dueDate: dueDateLabel,
				actor: actorName,
			},
			{ locale },
		);
		const reasonLine = normalizedReason
			? `\n${m.admin_billing_notification_reason_line(
					{ reason: normalizedReason },
					{ locale },
				)}`
			: '';

		dispatchNotificationEmail({
			to: recipient.email,
			subject: m.admin_billing_notification_collection_subject(
				{
					targetType: targetTypeLabel,
					targetName,
				},
				{ locale },
			),
			text: `${baseText}${reasonLine}`,
			idempotencyKey: buildCollectionAlertIdempotencyKey(
				subscriptionId,
				recipient.email,
				normalizedReason,
			),
		});
	}
};
type Locale = ReturnType<typeof getLocaleFromAsyncStorage>;
