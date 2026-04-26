import { createHash } from 'node:crypto';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import type { StoreStatus } from '@/features/.server/prisma/generated/client';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import * as m from '@/paraglide/messages.js';

type StoreNotificationRecipient = {
	email: string;
	name: string;
};

type StoreStatusNotificationInput = {
	storeId: string;
	storeName: string;
	mallName: string;
	nextStatus: StoreStatus;
	reason?: string | null;
	adminLocalUser: StoreNotificationRecipient | null;
	adminCcUser: StoreNotificationRecipient | null;
	changedByName?: string | null;
};

const getStoreStatusLabel = (status: StoreStatus): string => {
	if (status === 'ACTIVE') {
		return m.admin_stores_status_active();
	}

	if (status === 'SUSPENDED') {
		return m.admin_stores_status_suspended();
	}

	if (status === 'REJECTED') {
		return m.admin_stores_status_rejected();
	}

	if (status === 'PENDING_APPROVAL') {
		return m.admin_stores_status_pending_approval();
	}

	return m.admin_stores_status_draft();
};

const buildIdempotencyKey = (
	storeId: string,
	nextStatus: StoreStatus,
	recipientEmail: string,
	reason: string | null,
): string => {
	const digest = createHash('sha256')
		.update(`${storeId}:${nextStatus}:${recipientEmail}:${reason ?? ''}`)
		.digest('hex');

	return `admin-store-status/${digest}`;
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

export const notifyStoreStatusChange = ({
	storeId,
	storeName,
	mallName,
	nextStatus,
	reason,
	adminLocalUser,
	adminCcUser,
	changedByName,
}: StoreStatusNotificationInput): void => {
	const recipients = getUniqueRecipients([adminLocalUser, adminCcUser]);
	if (recipients.length === 0) {
		return;
	}

	const locale = getLocaleFromAsyncStorage();
	const statusLabel = getStoreStatusLabel(nextStatus);
	const normalizedReason = reason?.trim() ?? null;
	const actorName = changedByName?.trim().length
		? changedByName
		: m.admin_stores_notification_platform_admin({}, { locale });

	for (const recipient of recipients) {
		const baseText = m.admin_stores_notification_status_text(
			{
				name: recipient.name,
				storeName,
				mallName,
				status: statusLabel,
				actor: actorName,
			},
			{ locale },
		);
		const reasonLine = normalizedReason
			? `\n${m.admin_stores_notification_reason_line(
					{ reason: normalizedReason },
					{ locale },
				)}`
			: '';

		dispatchNotificationEmail({
			to: recipient.email,
			subject: m.admin_stores_notification_status_subject(
				{
					storeName,
					status: statusLabel,
				},
				{ locale },
			),
			text: `${baseText}${reasonLine}`,
			idempotencyKey: buildIdempotencyKey(
				storeId,
				nextStatus,
				recipient.email,
				normalizedReason,
			),
		});
	}
};
