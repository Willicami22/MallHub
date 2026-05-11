export const ADMIN_DASHBOARD_PERIOD_DAYS = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
} as const;

export type AdminDashboardPeriod = keyof typeof ADMIN_DASHBOARD_PERIOD_DAYS;

export const ADMIN_DASHBOARD_PERIOD_OPTIONS = ['7d', '30d', '90d'] as const;
