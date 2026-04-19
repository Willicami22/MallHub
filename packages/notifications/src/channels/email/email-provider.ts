import type { EmailNotificationPayload } from '../../core/notification.types';

export interface EmailProvider {
	send(payload: EmailNotificationPayload): Promise<void>;
}
