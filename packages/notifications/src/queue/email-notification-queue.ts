import { type JobsOptions, Queue } from 'bullmq';
import type Redis from 'ioredis';
import type {
	EmailNotificationPayload,
	EnqueueEmailNotificationOptions,
} from '@/email/email-notification.types';

const EMAIL_NOTIFICATIONS_QUEUE_NAME = 'email-notifications';
const EMAIL_NOTIFICATION_JOB_NAME = 'send-email';

const defaultEmailJobOptions: JobsOptions = {
	attempts: 5,
	backoff: {
		type: 'exponential',
		delay: 1000,
	},
	removeOnComplete: {
		age: 3600,
		count: 1000,
	},
	removeOnFail: {
		age: 86_400,
		count: 5000,
	},
};

export interface CreateEmailNotificationQueueOptions {
	connection: Redis;
	queueName?: string;
}

export const createEmailNotificationQueue = ({
	connection,
	queueName = EMAIL_NOTIFICATIONS_QUEUE_NAME,
}: CreateEmailNotificationQueueOptions): Queue<EmailNotificationPayload> => {
	return new Queue<EmailNotificationPayload>(queueName, {
		connection,
		defaultJobOptions: defaultEmailJobOptions,
	});
};

export interface EnqueueEmailNotificationInput {
	queue: Queue<EmailNotificationPayload>;
	payload: EmailNotificationPayload;
	options?: EnqueueEmailNotificationOptions;
}

export const enqueueEmailNotification = async ({
	queue,
	payload,
	options,
}: EnqueueEmailNotificationInput): Promise<void> => {
	const jobOptions: JobsOptions = {};

	if (options?.jobId) {
		jobOptions.jobId = options.jobId;
	}

	if (typeof options?.delayMs === 'number') {
		jobOptions.delay = options.delayMs;
	}

	await queue.add(EMAIL_NOTIFICATION_JOB_NAME, payload, jobOptions);
};

export { EMAIL_NOTIFICATION_JOB_NAME, EMAIL_NOTIFICATIONS_QUEUE_NAME };
