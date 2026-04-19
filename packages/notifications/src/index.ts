export { ConsoleEmailProvider } from './channels/email/console-email-provider';
export type { EmailProvider } from './channels/email/email-provider';
export {
	type CreateNotificationsModuleOptions,
	createNotificationsModule,
} from './core/create-notifications-module';
export type {
	DispatchOptions,
	EmailNotificationPayload,
	EmailRecipient,
	NotificationChannel,
	NotificationJob,
	NotificationPayload,
	SmsNotificationPayload,
} from './core/notification.types';
export { NotificationService } from './core/notification-service';
export { InMemoryNotificationQueue } from './queue/in-memory-notification-queue';
export type {
	NotificationJobProcessor,
	NotificationQueue,
} from './queue/notification-queue';
