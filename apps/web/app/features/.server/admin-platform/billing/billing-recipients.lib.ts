import type { BillingNotificationRecipient } from '@/features/.server/admin-platform/billing/billing-notification.lib';

type MaybeRecipient = {
	email: string;
	name: string;
} | null;

export const collectBillingRecipients = (
	...recipients: MaybeRecipient[]
): BillingNotificationRecipient[] => {
	const recipientsByEmail = new Map<string, BillingNotificationRecipient>();

	for (const recipient of recipients) {
		if (!recipient) {
			continue;
		}

		recipientsByEmail.set(recipient.email.toLowerCase(), {
			email: recipient.email,
			name: recipient.name,
		});
	}

	return Array.from(recipientsByEmail.values());
};
