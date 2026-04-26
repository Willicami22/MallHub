import { createRedisConnection } from '@mallhub/notifications';
import { auditEventActions } from '@/features/.server/audit/audit-event.lib';
import { serverEnv } from '@/features/.server/env/server-env.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';

export const PLATFORM_SERVICE_KEYS = [
	'DATABASE',
	'BETTER_AUTH',
	'NOTIFICATIONS',
	'METRICS_PIPELINE',
] as const;

export const PLATFORM_SERVICE_STATUSES = [
	'OPERATIONAL',
	'DEGRADED',
	'INCIDENT',
] as const;

export const PLATFORM_HEALTH_INCIDENT_STATUSES = ['OPEN', 'RESOLVED'] as const;

export const platformHealthSummaryCodes = {
	DATABASE_OK: 'DATABASE_OK',
	DATABASE_UNREACHABLE: 'DATABASE_UNREACHABLE',
	BETTER_AUTH_OK: 'BETTER_AUTH_OK',
	BETTER_AUTH_MISSING_PLATFORM_ADMIN: 'BETTER_AUTH_MISSING_PLATFORM_ADMIN',
	NOTIFICATIONS_OK: 'NOTIFICATIONS_OK',
	NOTIFICATIONS_UNREACHABLE: 'NOTIFICATIONS_UNREACHABLE',
	NOTIFICATIONS_ENQUEUE_FAILURES_RECENT:
		'NOTIFICATIONS_ENQUEUE_FAILURES_RECENT',
	METRICS_RECENT: 'METRICS_RECENT',
	METRICS_STALE: 'METRICS_STALE',
	METRICS_MISSING: 'METRICS_MISSING',
	OPEN_MODERATION_REPORTS_HIGH: 'OPEN_MODERATION_REPORTS_HIGH',
	PENDING_STORE_REGISTRATIONS_HIGH: 'PENDING_STORE_REGISTRATIONS_HIGH',
} as const;

export const PLATFORM_HEALTH_ALERT_SEVERITIES = [
	'CRITICAL',
	'WARNING',
	'INFO',
] as const;

export type PlatformServiceKey = (typeof PLATFORM_SERVICE_KEYS)[number];
export type PlatformServiceStatus = (typeof PLATFORM_SERVICE_STATUSES)[number];
export type PlatformHealthSummaryCode =
	(typeof platformHealthSummaryCodes)[keyof typeof platformHealthSummaryCodes];
export type PlatformHealthSummaryParams = Record<
	string,
	string | number | boolean | null
>;
export type PlatformHealthAlertSeverity =
	(typeof PLATFORM_HEALTH_ALERT_SEVERITIES)[number];

export type PlatformServiceDiagnostic = {
	serviceKey: PlatformServiceKey;
	status: PlatformServiceStatus;
	summaryCode: PlatformHealthSummaryCode;
	summaryParams?: PlatformHealthSummaryParams;
	metadata?: PlatformHealthSummaryParams;
	observedAt: Date;
};

export type PlatformHealthAlertDiagnostic = {
	id: string;
	severity: PlatformHealthAlertSeverity;
	code: PlatformHealthSummaryCode;
	params?: PlatformHealthSummaryParams;
	relatedServiceKey?: PlatformServiceKey;
};

const PENDING_STORE_REGISTRATIONS_ALERT_THRESHOLD = 15;
const PENDING_STORE_REGISTRATIONS_CRITICAL_THRESHOLD = 40;
const OPEN_MODERATION_REPORTS_ALERT_THRESHOLD = 25;
const OPEN_MODERATION_REPORTS_CRITICAL_THRESHOLD = 75;
const NOTIFICATIONS_ENQUEUE_FAILURES_ALERT_THRESHOLD = 1;
const NOTIFICATIONS_ENQUEUE_FAILURES_CRITICAL_THRESHOLD = 5;
const NOTIFICATIONS_ENQUEUE_FAILURES_WINDOW_HOURS = 24;

const withTimeout = async <T>(
	promise: Promise<T>,
	timeoutMs: number,
): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error(`Operation timed out after ${timeoutMs}ms`));
		}, timeoutMs);

		promise
			.then((value) => {
				clearTimeout(timeout);
				resolve(value);
			})
			.catch((error: unknown) => {
				clearTimeout(timeout);
				reject(error);
			});
	});
};

const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}

	return 'Unknown error';
};

const getLagHours = (date: Date): number =>
	Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)));

const checkDatabaseService = async (): Promise<PlatformServiceDiagnostic> => {
	const observedAt = new Date();

	try {
		await prisma.$queryRaw`SELECT 1`;

		return {
			serviceKey: 'DATABASE',
			status: 'OPERATIONAL',
			summaryCode: platformHealthSummaryCodes.DATABASE_OK,
			observedAt,
		};
	} catch (error) {
		return {
			serviceKey: 'DATABASE',
			status: 'INCIDENT',
			summaryCode: platformHealthSummaryCodes.DATABASE_UNREACHABLE,
			metadata: {
				error: getErrorMessage(error),
			},
			observedAt,
		};
	}
};

const checkBetterAuthService = async (): Promise<PlatformServiceDiagnostic> => {
	const observedAt = new Date();
	const platformAdminUsers = await prisma.user.count({
		where: {
			role: 'ADMIN_PLATFORM',
		},
	});

	if (platformAdminUsers === 0) {
		return {
			serviceKey: 'BETTER_AUTH',
			status: 'INCIDENT',
			summaryCode:
				platformHealthSummaryCodes.BETTER_AUTH_MISSING_PLATFORM_ADMIN,
			observedAt,
		};
	}

	return {
		serviceKey: 'BETTER_AUTH',
		status: 'OPERATIONAL',
		summaryCode: platformHealthSummaryCodes.BETTER_AUTH_OK,
		observedAt,
	};
};

const checkNotificationsService =
	async (): Promise<PlatformServiceDiagnostic> => {
		const observedAt = new Date();
		const redisConnection = createRedisConnection({
			url: serverEnv.REDIS_URL,
		});

		try {
			await withTimeout(redisConnection.ping(), 2500);

			return {
				serviceKey: 'NOTIFICATIONS',
				status: 'OPERATIONAL',
				summaryCode: platformHealthSummaryCodes.NOTIFICATIONS_OK,
				observedAt,
			};
		} catch (error) {
			return {
				serviceKey: 'NOTIFICATIONS',
				status: 'INCIDENT',
				summaryCode: platformHealthSummaryCodes.NOTIFICATIONS_UNREACHABLE,
				metadata: {
					error: getErrorMessage(error),
				},
				observedAt,
			};
		} finally {
			redisConnection.disconnect();
		}
	};

const checkMetricsPipelineService =
	async (): Promise<PlatformServiceDiagnostic> => {
		const observedAt = new Date();
		const latestMetric = await prisma.dailyPlatformMetric.findFirst({
			select: {
				metricDate: true,
			},
			orderBy: {
				metricDate: 'desc',
			},
		});

		if (!latestMetric) {
			return {
				serviceKey: 'METRICS_PIPELINE',
				status: 'INCIDENT',
				summaryCode: platformHealthSummaryCodes.METRICS_MISSING,
				observedAt,
			};
		}

		const lagHours = getLagHours(latestMetric.metricDate);

		if (lagHours > 24 * 7) {
			return {
				serviceKey: 'METRICS_PIPELINE',
				status: 'INCIDENT',
				summaryCode: platformHealthSummaryCodes.METRICS_STALE,
				summaryParams: { lagHours },
				observedAt,
			};
		}

		if (lagHours > 48) {
			return {
				serviceKey: 'METRICS_PIPELINE',
				status: 'DEGRADED',
				summaryCode: platformHealthSummaryCodes.METRICS_STALE,
				summaryParams: { lagHours },
				observedAt,
			};
		}

		return {
			serviceKey: 'METRICS_PIPELINE',
			status: 'OPERATIONAL',
			summaryCode: platformHealthSummaryCodes.METRICS_RECENT,
			summaryParams: { lagHours },
			observedAt,
		};
	};

export const readPlatformServiceDiagnostics = async (): Promise<
	PlatformServiceDiagnostic[]
> => {
	const diagnostics = await Promise.all([
		checkDatabaseService(),
		checkBetterAuthService(),
		checkNotificationsService(),
		checkMetricsPipelineService(),
	]);

	const order = new Map(
		PLATFORM_SERVICE_KEYS.map((serviceKey, index) => [serviceKey, index]),
	);

	return diagnostics.sort((left, right) => {
		const leftOrder = order.get(left.serviceKey) ?? 0;
		const rightOrder = order.get(right.serviceKey) ?? 0;
		return leftOrder - rightOrder;
	});
};

const getAlertSeverity = (
	count: number,
	criticalThreshold: number,
): PlatformHealthAlertSeverity =>
	count >= criticalThreshold ? 'CRITICAL' : 'WARNING';

export const readPlatformBackofficeAlerts = async (): Promise<
	PlatformHealthAlertDiagnostic[]
> => {
	const notificationFailureWindowStartsAt = new Date(
		Date.now() - NOTIFICATIONS_ENQUEUE_FAILURES_WINDOW_HOURS * 60 * 60 * 1000,
	);
	const [
		notificationEnqueueFailures,
		pendingStoreRegistrations,
		openModerationReports,
	] = await Promise.all([
		prisma.auditEvent.count({
			where: {
				action: auditEventActions.ADMIN_NOTIFICATIONS_EMAIL_ENQUEUE_FAILED,
				createdAt: {
					gte: notificationFailureWindowStartsAt,
				},
			},
		}),
		prisma.storeRegistrationRequest.count({
			where: {
				status: 'PENDING',
			},
		}),
		prisma.moderationReport.count({
			where: {
				status: 'OPEN',
			},
		}),
	]);

	const alerts: PlatformHealthAlertDiagnostic[] = [];

	if (
		notificationEnqueueFailures >=
		NOTIFICATIONS_ENQUEUE_FAILURES_ALERT_THRESHOLD
	) {
		alerts.push({
			id: 'notifications-enqueue-failures-recent',
			severity: getAlertSeverity(
				notificationEnqueueFailures,
				NOTIFICATIONS_ENQUEUE_FAILURES_CRITICAL_THRESHOLD,
			),
			code: platformHealthSummaryCodes.NOTIFICATIONS_ENQUEUE_FAILURES_RECENT,
			params: {
				count: notificationEnqueueFailures,
				windowHours: NOTIFICATIONS_ENQUEUE_FAILURES_WINDOW_HOURS,
			},
			relatedServiceKey: 'NOTIFICATIONS',
		});
	}

	if (
		pendingStoreRegistrations >= PENDING_STORE_REGISTRATIONS_ALERT_THRESHOLD
	) {
		alerts.push({
			id: 'pending-store-registrations',
			severity: getAlertSeverity(
				pendingStoreRegistrations,
				PENDING_STORE_REGISTRATIONS_CRITICAL_THRESHOLD,
			),
			code: platformHealthSummaryCodes.PENDING_STORE_REGISTRATIONS_HIGH,
			params: {
				count: pendingStoreRegistrations,
			},
		});
	}

	if (openModerationReports >= OPEN_MODERATION_REPORTS_ALERT_THRESHOLD) {
		alerts.push({
			id: 'open-moderation-reports',
			severity: getAlertSeverity(
				openModerationReports,
				OPEN_MODERATION_REPORTS_CRITICAL_THRESHOLD,
			),
			code: platformHealthSummaryCodes.OPEN_MODERATION_REPORTS_HIGH,
			params: {
				count: openModerationReports,
			},
		});
	}

	return alerts;
};
