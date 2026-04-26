import { type Queue, Worker, type WorkerOptions } from 'bullmq';
import type Redis from 'ioredis';
import type { EmailNotificationPayload } from '@/email/email-notification.types';
import { EMAIL_NOTIFICATIONS_QUEUE_NAME } from '@/queue/email-notification-queue';

export interface CreateEmailNotificationWorkerOptions {
	connection: Redis;
	processor: (payload: EmailNotificationPayload) => Promise<void>;
	queueName?: string;
	concurrency?: number;
	limiter?: WorkerOptions['limiter'];
}

export const createEmailNotificationWorker = ({
	connection,
	processor,
	queueName = EMAIL_NOTIFICATIONS_QUEUE_NAME,
	concurrency = 5,
	limiter = {
		max: 60,
		duration: 60_000,
	},
}: CreateEmailNotificationWorkerOptions): Worker<EmailNotificationPayload> => {
	const worker = new Worker<EmailNotificationPayload>(
		queueName,
		async (job) => {
			await processor(job.data);
		},
		{
			connection,
			concurrency,
			limiter,
		},
	);

	worker.on('failed', (job, error) => {
		console.error('[notifications.worker] Job failed', {
			jobId: job?.id,
			error,
		});
	});

	worker.on('stalled', (jobId) => {
		console.warn('[notifications.worker] Job stalled', {
			jobId,
		});
	});

	return worker;
};

export interface CloseEmailNotificationInfrastructureInput {
	worker: Worker<EmailNotificationPayload>;
	queue: Queue<EmailNotificationPayload>;
	connection: Redis;
}

export const closeEmailNotificationInfrastructure = async ({
	worker,
	queue,
	connection,
}: CloseEmailNotificationInfrastructureInput): Promise<void> => {
	await worker.pause();
	await worker.close();
	await queue.close();
	await connection.quit();
};
