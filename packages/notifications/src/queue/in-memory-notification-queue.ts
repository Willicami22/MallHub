import type { NotificationJob } from '../core/notification.types';
import type {
	NotificationJobProcessor,
	NotificationQueue,
} from './notification-queue';

export class InMemoryNotificationQueue implements NotificationQueue {
	private readonly jobs = new Map<string, NotificationJob>();
	private processor?: NotificationJobProcessor;

	async enqueue(job: NotificationJob): Promise<void> {
		this.jobs.set(job.id, job);
		if (!this.processor) {
			return;
		}
		this.schedule(job);
	}

	async process(processor: NotificationJobProcessor): Promise<void> {
		this.processor = processor;
		for (const job of this.jobs.values()) {
			this.schedule(job);
		}
	}

	private schedule(job: NotificationJob): void {
		const waitMs = Math.max(job.runAt.getTime() - Date.now(), 0);
		const run = async () => {
			await this.processor?.(job);
			this.jobs.delete(job.id);
		};

		if (waitMs === 0) {
			void run();
			return;
		}

		setTimeout(() => {
			void run();
		}, waitMs);
	}
}
