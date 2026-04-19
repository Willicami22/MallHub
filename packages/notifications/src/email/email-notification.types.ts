export interface EmailNotificationPayload {
	to: string;
	subject: string;
	text: string;
	html?: string;
	idempotencyKey?: string;
	metadata?: Record<string, string>;
}

export interface EnqueueEmailNotificationOptions {
	delayMs?: number;
	jobId?: string;
}
