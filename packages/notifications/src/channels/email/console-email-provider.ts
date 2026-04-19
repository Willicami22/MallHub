import type {
	EmailNotificationPayload,
	EmailRecipient,
} from '../../core/notification.types';
import type { EmailProvider } from './email-provider';

const toRecipientArray = (
	to: EmailRecipient | EmailRecipient[],
): EmailRecipient[] => {
	return Array.isArray(to) ? to : [to];
};

const formatRecipient = (recipient: EmailRecipient): string => {
	if (recipient.name) {
		return `${recipient.name} <${recipient.email}>`;
	}
	return recipient.email;
};

export class ConsoleEmailProvider implements EmailProvider {
	async send(payload: EmailNotificationPayload): Promise<void> {
		const recipients = toRecipientArray(payload.to)
			.map((recipient) => formatRecipient(recipient))
			.join(', ');

		console.info(
			`[notifications:email] subject="${payload.subject}" to="${recipients}"`,
		);
	}
}
