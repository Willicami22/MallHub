import { ConsoleEmailProvider } from '../channels/email/console-email-provider';
import type { EmailProvider } from '../channels/email/email-provider';
import type { NotificationQueue } from '../queue/notification-queue';
import { NotificationService } from './notification-service';

export interface CreateNotificationsModuleOptions {
	emailProvider?: EmailProvider;
	queue?: NotificationQueue;
}

export const createNotificationsModule = (
	options: CreateNotificationsModuleOptions = {},
) => {
	const emailProvider = options.emailProvider ?? new ConsoleEmailProvider();

	const service = new NotificationService({
		queue: options.queue,
		handlers: {
			email: async (payload) => {
				await emailProvider.send(payload);
			},
		},
	});

	return {
		service,
		emailProvider,
	};
};
