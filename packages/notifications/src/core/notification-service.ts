import { randomUUID } from 'node:crypto';
import type { NotificationQueue } from '../queue/notification-queue';
import type {
	DispatchOptions,
	EmailNotificationPayload,
	NotificationJob,
	NotificationPayload,
	SmsNotificationPayload,
} from './notification.types';

export interface NotificationHandlers {
	email?: (payload: EmailNotificationPayload) => Promise<void>;
	sms?: (payload: SmsNotificationPayload) => Promise<void>;
}

export interface NotificationServiceOptions {
	handlers: NotificationHandlers;
	queue?: NotificationQueue;
	createId?: () => string;
	now?: () => Date;
}

export class NotificationService {
	private readonly createId: () => string;
	private readonly now: () => Date;
	private readonly queue?: NotificationQueue;
	private readonly handlers: NotificationHandlers;

	constructor(options: NotificationServiceOptions) {
		this.createId = options.createId ?? randomUUID;
		this.now = options.now ?? (() => new Date());
		this.queue = options.queue;
		this.handlers = options.handlers;
	}

	async dispatch(
		payload: NotificationPayload,
		options: DispatchOptions = {},
	): Promise<NotificationJob> {
		const currentTime = this.now();
		const runAt = options.runAt ?? currentTime;
		const job: NotificationJob = {
			id: this.createId(),
			payload,
			createdAt: currentTime,
			runAt,
		};

		if (!this.queue && runAt.getTime() > currentTime.getTime()) {
			throw new Error('Cannot schedule notifications without a queue.');
		}

		if (!this.queue) {
			await this.execute(job);
			return job;
		}

		await this.queue.enqueue(job);
		return job;
	}

	async startWorker(): Promise<void> {
		if (!this.queue) {
			return;
		}

		await this.queue.process(async (job) => {
			await this.execute(job);
		});
	}

	async sendEmail(
		payload: Omit<EmailNotificationPayload, 'channel'>,
		options?: DispatchOptions,
	): Promise<NotificationJob> {
		return this.dispatch({ channel: 'email', ...payload }, options);
	}

	private async execute(job: NotificationJob): Promise<void> {
		switch (job.payload.channel) {
			case 'email': {
				const emailHandler = this.handlers.email;
				if (!emailHandler) {
					throw new Error('No email notification handler configured.');
				}
				await emailHandler(job.payload);
				return;
			}

			case 'sms': {
				const smsHandler = this.handlers.sms;
				if (!smsHandler) {
					throw new Error('No sms notification handler configured.');
				}
				await smsHandler(job.payload);
				return;
			}
		}
	}
}
