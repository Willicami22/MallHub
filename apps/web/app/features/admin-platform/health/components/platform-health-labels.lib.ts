import * as m from '@/paraglide/messages.js';

export type PlatformServiceKey =
	| 'DATABASE'
	| 'BETTER_AUTH'
	| 'NOTIFICATIONS'
	| 'METRICS_PIPELINE';

export type PlatformServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'INCIDENT';

export type PlatformHealthIncidentStatus = 'OPEN' | 'RESOLVED';

export type PlatformHealthAlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

type SummaryParams = Record<string, unknown> | null | undefined;

const getNumberParam = (params: SummaryParams, key: string): number => {
	const value = params?.[key];
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsed = Number.parseFloat(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return 0;
};

export const getPlatformServiceLabel = (
	serviceKey: PlatformServiceKey,
): string => {
	if (serviceKey === 'DATABASE') {
		return m.admin_health_service_database();
	}

	if (serviceKey === 'BETTER_AUTH') {
		return m.admin_health_service_better_auth();
	}

	if (serviceKey === 'NOTIFICATIONS') {
		return m.admin_health_service_notifications();
	}

	return m.admin_health_service_metrics_pipeline();
};

export const getPlatformServiceStatusLabel = (
	status: PlatformServiceStatus,
): string => {
	if (status === 'OPERATIONAL') {
		return m.admin_health_service_status_operational();
	}

	if (status === 'DEGRADED') {
		return m.admin_health_service_status_degraded();
	}

	return m.admin_health_service_status_incident();
};

export const getPlatformHealthIncidentStatusLabel = (
	status: PlatformHealthIncidentStatus,
): string => {
	if (status === 'OPEN') {
		return m.admin_health_incident_status_open();
	}

	return m.admin_health_incident_status_resolved();
};

export const getPlatformHealthAlertSeverityLabel = (
	severity: PlatformHealthAlertSeverity,
): string => {
	if (severity === 'CRITICAL') {
		return m.admin_health_alert_severity_critical();
	}

	if (severity === 'WARNING') {
		return m.admin_health_alert_severity_warning();
	}

	return m.admin_health_alert_severity_info();
};

export const getPlatformHealthSummaryMessage = (
	summaryCode: string,
	params?: SummaryParams,
): string => {
	if (summaryCode === 'DATABASE_OK') {
		return m.admin_health_summary_database_ok();
	}

	if (summaryCode === 'DATABASE_UNREACHABLE') {
		return m.admin_health_summary_database_unreachable();
	}

	if (summaryCode === 'BETTER_AUTH_OK') {
		return m.admin_health_summary_better_auth_ok();
	}

	if (summaryCode === 'BETTER_AUTH_MISSING_PLATFORM_ADMIN') {
		return m.admin_health_summary_better_auth_missing_platform_admin();
	}

	if (summaryCode === 'NOTIFICATIONS_OK') {
		return m.admin_health_summary_notifications_ok();
	}

	if (summaryCode === 'NOTIFICATIONS_UNREACHABLE') {
		return m.admin_health_summary_notifications_unreachable();
	}

	if (summaryCode === 'METRICS_RECENT') {
		return m.admin_health_summary_metrics_recent({
			lagHours: getNumberParam(params, 'lagHours').toString(),
		});
	}

	if (summaryCode === 'METRICS_STALE') {
		return m.admin_health_summary_metrics_stale({
			lagHours: getNumberParam(params, 'lagHours').toString(),
		});
	}

	if (summaryCode === 'METRICS_MISSING') {
		return m.admin_health_summary_metrics_missing();
	}

	if (summaryCode === 'OPEN_MODERATION_REPORTS_HIGH') {
		return m.admin_health_summary_open_moderation_reports_high({
			count: getNumberParam(params, 'count').toString(),
		});
	}

	if (summaryCode === 'PENDING_STORE_REGISTRATIONS_HIGH') {
		return m.admin_health_summary_pending_store_registrations_high({
			count: getNumberParam(params, 'count').toString(),
		});
	}

	return summaryCode;
};
