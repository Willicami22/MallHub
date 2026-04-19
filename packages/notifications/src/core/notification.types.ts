export type NotificationChannel = 'email' | 'sms';

export interface EmailRecipient {
	email: string;
	name?: string;
}

export interface EmailNotificationPayload {
	channel: 'email';
	to: EmailRecipient | EmailRecipient[];
	subject: string;
	text?: string;
	html?: string;
	from?: EmailRecipient;
	replyTo?: EmailRecipient;
	metadata?: Record<string, string>;
}

export interface SmsNotificationPayload {
	channel: 'sms';
	to: string;
	message: string;
	metadata?: Record<string, string>;
}

export type NotificationPayload =
	| EmailNotificationPayload
	| SmsNotificationPayload;

export interface DispatchOptions {
	runAt?: Date;
}

export interface NotificationJob {
	id: string;
	payload: NotificationPayload;
	createdAt: Date;
	runAt: Date;
}
