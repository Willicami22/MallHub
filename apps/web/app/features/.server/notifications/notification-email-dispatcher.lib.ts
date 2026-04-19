import { randomUUID } from 'node:crypto';
import {
	closeEmailNotificationInfrastructure,
	createEmailNotificationQueue,
	createEmailNotificationWorker,
	createRedisConnection,
	type EmailNotificationPayload,
	enqueueEmailNotification,
} from '@mallhub/notifications';
import { Resend } from 'resend';
import { serverEnv } from '@/features/.server/env/server-env.lib';

interface NotificationRuntime {
	redisConnection: ReturnType<typeof createRedisConnection>;
	notificationQueue: ReturnType<typeof createEmailNotificationQueue>;
	notificationWorker: ReturnType<typeof createEmailNotificationWorker>;
	shutdownRegistered: boolean;
	isShuttingDown: boolean;
}

const createNotificationRuntime = (): NotificationRuntime => {
	const redisConnection = createRedisConnection({
		url: serverEnv.REDIS_URL,
	});

	const notificationQueue = createEmailNotificationQueue({
		connection: redisConnection,
	});

	const resend = new Resend(serverEnv.RESEND_API_KEY);
	const fromAddress = serverEnv.RESEND_FROM_NAME
		? `${serverEnv.RESEND_FROM_NAME} <${serverEnv.RESEND_FROM_EMAIL}>`
		: serverEnv.RESEND_FROM_EMAIL;

	const notificationWorker = createEmailNotificationWorker({
		connection: redisConnection,
		concurrency: serverEnv.NOTIFICATIONS_WORKER_CONCURRENCY,
		limiter: {
			max: serverEnv.NOTIFICATIONS_WORKER_LIMIT_MAX,
			duration: serverEnv.NOTIFICATIONS_WORKER_LIMIT_DURATION_MS,
		},
		processor: async (payload) => {
			const { error } = await resend.emails.send(
				{
					from: fromAddress,
					to: payload.to,
					subject: payload.subject,
					text: payload.text,
					html: payload.html,
				},
				payload.idempotencyKey
					? {
							idempotencyKey: payload.idempotencyKey,
						}
					: undefined,
			);

			if (error) {
				throw new Error(`[${error.name}] ${error.message}`);
			}
		},
	});

	return {
		redisConnection,
		notificationQueue,
		notificationWorker,
		shutdownRegistered: false,
		isShuttingDown: false,
	};
};

const withIdempotencyKey = (
	payload: EmailNotificationPayload,
): EmailNotificationPayload => {
	if (payload.idempotencyKey) {
		return payload;
	}

	return {
		...payload,
		idempotencyKey: `notification-email/${randomUUID()}`,
	};
};

const globalForNotifications = globalThis as typeof globalThis & {
	notificationRuntime?: NotificationRuntime;
};

const notificationRuntime =
	globalForNotifications.notificationRuntime ?? createNotificationRuntime();

if (process.env.NODE_ENV !== 'production') {
	globalForNotifications.notificationRuntime = notificationRuntime;
}

const shutdownNotifications = async (): Promise<void> => {
	if (notificationRuntime.isShuttingDown) {
		return;
	}

	notificationRuntime.isShuttingDown = true;

	await closeEmailNotificationInfrastructure({
		worker: notificationRuntime.notificationWorker,
		queue: notificationRuntime.notificationQueue,
		connection: notificationRuntime.redisConnection,
	});
};

if (!notificationRuntime.shutdownRegistered) {
	process.once('SIGTERM', () => {
		void shutdownNotifications();
	});

	process.once('SIGINT', () => {
		void shutdownNotifications();
	});

	notificationRuntime.shutdownRegistered = true;
}

export const dispatchNotificationEmail = (
	payload: EmailNotificationPayload,
): void => {
	const queuedPayload = withIdempotencyKey(payload);

	void enqueueEmailNotification({
		queue: notificationRuntime.notificationQueue,
		payload: queuedPayload,
	}).catch((error) => {
		console.error('[notifications.dispatch] Failed to enqueue email', {
			to: queuedPayload.to,
			subject: queuedPayload.subject,
			idempotencyKey: queuedPayload.idempotencyKey,
			error,
		});
	});
};
