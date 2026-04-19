import type { NotificationJob } from '../core/notification.types';

export type NotificationJobProcessor = (job: NotificationJob) => Promise<void>;

export interface NotificationQueue {
	enqueue(job: NotificationJob): Promise<void>;
	process(processor: NotificationJobProcessor): Promise<void>;
}
