import { createHash } from 'node:crypto';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import * as m from '@/paraglide/messages.js';

type StoreNotificationRecipient = {
	email: string;
	name: string;
};

type StoreRegistrationDecision = 'APPROVED' | 'REJECTED';

type StoreRegistrationDecisionNotificationInput = {
	registrationRequestId: string;
	storeName: string;
	mallName: string;
	decision: StoreRegistrationDecision;
	reason?: string | null;
	applicantUser: StoreNotificationRecipient | null;
	adminCcUser: StoreNotificationRecipient | null;
	changedByName?: string | null;
};

const getDecisionLabel = (decision: StoreRegistrationDecision): string => {
	if (decision === 'APPROVED') {
		return m.admin_store_registrations_notification_decision_approved();
	}

	return m.admin_store_registrations_notification_decision_rejected();
};

const buildIdempotencyKey = (
	registrationRequestId: string,
	decision: StoreRegistrationDecision,
	recipientEmail: string,
	reason: string | null,
): string => {
	const digest = createHash('sha256')
		.update(
			`${registrationRequestId}:${decision}:${recipientEmail}:${reason ?? ''}`,
		)
		.digest('hex');

	return `admin-store-registration-decision/${digest}`;
};

const getUniqueRecipients = (
	recipients: Array<StoreNotificationRecipient | null>,
): StoreNotificationRecipient[] => {
	const recipientsByEmail = new Map<string, StoreNotificationRecipient>();

	for (const recipient of recipients) {
		if (!recipient) {
			continue;
		}

		recipientsByEmail.set(recipient.email.toLowerCase(), recipient);
	}

	return Array.from(recipientsByEmail.values());
};

export const notifyStoreRegistrationDecision = ({
	registrationRequestId,
	storeName,
	mallName,
	decision,
	reason,
	applicantUser,
	adminCcUser,
	changedByName,
}: StoreRegistrationDecisionNotificationInput): void => {
	const recipients = getUniqueRecipients([applicantUser, adminCcUser]);
	if (recipients.length === 0) {
		return;
	}

	const locale = getLocaleFromAsyncStorage();
	const decisionLabel = getDecisionLabel(decision);
	const normalizedReason = reason?.trim() ?? null;
	const actorName = changedByName?.trim().length
		? changedByName
		: m.admin_store_registrations_notification_platform_admin({}, { locale });

	for (const recipient of recipients) {
		const baseText = m.admin_store_registrations_notification_decision_text(
			{
				name: recipient.name,
				storeName,
				mallName,
				decision: decisionLabel,
				actor: actorName,
			},
			{ locale },
		);
		const reasonLine = normalizedReason
			? `\n${m.admin_store_registrations_notification_reason_line(
					{ reason: normalizedReason },
					{ locale },
				)}`
			: '';

		dispatchNotificationEmail({
			to: recipient.email,
			subject: m.admin_store_registrations_notification_decision_subject(
				{
					storeName,
					decision: decisionLabel,
				},
				{ locale },
			),
			text: `${baseText}${reasonLine}`,
			idempotencyKey: buildIdempotencyKey(
				registrationRequestId,
				decision,
				recipient.email,
				normalizedReason,
			),
		});
	}
};
