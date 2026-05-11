import { createHash } from 'node:crypto';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import type { MallStatus } from '@/features/.server/prisma/generated/client';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import * as m from '@/paraglide/messages.js';

type MallStatusNotificationInput = {
	mallId: string;
	mallName: string;
	nextStatus: MallStatus;
	reason?: string | null;
	adminCcUser: {
		email: string;
		name: string;
	} | null;
	changedByName?: string | null;
};

const getMallStatusLabel = (status: MallStatus): string => {
	const locale = getLocaleFromAsyncStorage();
	if (status === 'ACTIVE') {
		return m.admin_malls_status_active({}, { locale });
	}

	if (status === 'SUSPENDED') {
		return m.admin_malls_status_suspended({}, { locale });
	}

	return m.admin_malls_status_inactive({}, { locale });
};

const buildIdempotencyKey = (
	mallId: string,
	nextStatus: MallStatus,
	recipientEmail: string,
	reason: string | null,
): string => {
	const digest = createHash('sha256')
		.update(`${mallId}:${nextStatus}:${recipientEmail}:${reason ?? ''}`)
		.digest('hex');

	return `admin-mall-status/${digest}`;
};

export const notifyMallStatusChange = ({
	mallId,
	mallName,
	nextStatus,
	reason,
	adminCcUser,
	changedByName,
}: MallStatusNotificationInput): void => {
	if (!adminCcUser) {
		return;
	}

	const locale = getLocaleFromAsyncStorage();
	const statusLabel = getMallStatusLabel(nextStatus);
	const normalizedReason = reason?.trim() ?? null;

	const baseText = m.admin_malls_notification_status_text(
		{
			name: adminCcUser.name,
			mallName,
			status: statusLabel,
			actor: changedByName?.trim().length
				? changedByName
				: m.admin_malls_notification_platform_admin({}, { locale }),
		},
		{ locale },
	);
	const reasonLine = normalizedReason
		? `\n${m.admin_malls_notification_reason_line(
				{ reason: normalizedReason },
				{ locale },
			)}`
		: '';

	dispatchNotificationEmail({
		to: adminCcUser.email,
		subject: m.admin_malls_notification_status_subject(
			{
				mallName,
				status: statusLabel,
			},
			{ locale },
		),
		text: `${baseText}${reasonLine}`,
		idempotencyKey: buildIdempotencyKey(
			mallId,
			nextStatus,
			adminCcUser.email,
			normalizedReason,
		),
	});
};
