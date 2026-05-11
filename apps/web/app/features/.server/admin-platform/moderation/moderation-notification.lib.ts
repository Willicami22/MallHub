import { createHash } from 'node:crypto';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import * as m from '@/paraglide/messages.js';

type ModerationNotificationRecipient = {
	email: string;
	name: string;
};

type NotifyModerationDecisionInput = {
	moderationReportId: string;
	actionKey: string;
	targetLabel: string;
	actionLabel: string;
	reason?: string | null;
	adminLocalUser: ModerationNotificationRecipient | null;
	adminCcUser: ModerationNotificationRecipient | null;
	changedByName?: string | null;
};

const buildIdempotencyKey = (
	moderationReportId: string,
	actionKey: string,
	recipientEmail: string,
	reason: string | null,
): string => {
	const digest = createHash('sha256')
		.update(
			`${moderationReportId}:${actionKey}:${recipientEmail}:${reason ?? ''}`,
		)
		.digest('hex');

	return `admin-moderation/${digest}`;
};

const getUniqueRecipients = (
	recipients: Array<ModerationNotificationRecipient | null>,
): ModerationNotificationRecipient[] => {
	const recipientsByEmail = new Map<string, ModerationNotificationRecipient>();

	for (const recipient of recipients) {
		if (!recipient) {
			continue;
		}

		recipientsByEmail.set(recipient.email.toLowerCase(), recipient);
	}

	return Array.from(recipientsByEmail.values());
};

export const notifyModerationDecision = ({
	moderationReportId,
	actionKey,
	targetLabel,
	actionLabel,
	reason,
	adminLocalUser,
	adminCcUser,
	changedByName,
}: NotifyModerationDecisionInput): void => {
	const recipients = getUniqueRecipients([adminLocalUser, adminCcUser]);
	if (recipients.length === 0) {
		return;
	}

	const locale = getLocaleFromAsyncStorage();
	const normalizedReason = reason?.trim() ?? null;
	const actorName = changedByName?.trim().length
		? changedByName
		: m.admin_moderation_notification_platform_admin({}, { locale });

	for (const recipient of recipients) {
		const baseText = m.admin_moderation_notification_text(
			{
				name: recipient.name,
				target: targetLabel,
				action: actionLabel,
				actor: actorName,
			},
			{ locale },
		);
		const reasonLine = normalizedReason
			? `\n${m.admin_moderation_notification_reason_line(
					{ reason: normalizedReason },
					{ locale },
				)}`
			: '';

		dispatchNotificationEmail({
			to: recipient.email,
			subject: m.admin_moderation_notification_subject(
				{
					target: targetLabel,
				},
				{ locale },
			),
			text: `${baseText}${reasonLine}`,
			idempotencyKey: buildIdempotencyKey(
				moderationReportId,
				actionKey,
				recipient.email,
				normalizedReason,
			),
		});
	}
};
