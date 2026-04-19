import {
	closeEmailNotificationInfrastructure,
	createEmailNotificationQueue,
	createEmailNotificationWorker,
	createRedisConnection,
	type EmailNotificationPayload,
	enqueueEmailNotification,
} from '@mallhub/notifications';
import { createTransport } from 'nodemailer';
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

	const smtpAuth =
		serverEnv.SMTP_USER && serverEnv.SMTP_PASSWORD
			? {
					user: serverEnv.SMTP_USER,
					pass: serverEnv.SMTP_PASSWORD,
				}
			: undefined;

	const smtpTransport = createTransport({
		host: serverEnv.SMTP_HOST,
		port: serverEnv.SMTP_PORT,
		secure: serverEnv.SMTP_SECURE,
		auth: smtpAuth,
	});

	const fromAddress = serverEnv.SMTP_FROM_NAME
		? `"${serverEnv.SMTP_FROM_NAME}" <${serverEnv.SMTP_FROM_EMAIL}>`
		: serverEnv.SMTP_FROM_EMAIL;

	const notificationWorker = createEmailNotificationWorker({
		connection: redisConnection,
		concurrency: serverEnv.NOTIFICATIONS_WORKER_CONCURRENCY,
		limiter: {
			max: serverEnv.NOTIFICATIONS_WORKER_LIMIT_MAX,
			duration: serverEnv.NOTIFICATIONS_WORKER_LIMIT_DURATION_MS,
		},
		processor: async (payload) => {
			await smtpTransport.sendMail({
				from: fromAddress,
				to: payload.to,
				subject: payload.subject,
				text: payload.text,
				html: payload.html,
			});
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
	void enqueueEmailNotification({
		queue: notificationRuntime.notificationQueue,
		payload,
	}).catch((error) => {
		console.error('[notifications.dispatch] Failed to enqueue email', {
			to: payload.to,
			subject: payload.subject,
			error,
		});
	});
};
