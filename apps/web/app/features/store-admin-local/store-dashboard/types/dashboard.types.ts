export type DashboardMetricKey =
	| 'revenueCents'
	| 'orders'
	| 'conversionRate'
	| 'activeListings';

export type DashboardMetric = {
	key: DashboardMetricKey;
	label: string;
	value: string;
	hint: string;
	deltaLabel: string;
};

export type DashboardMetricsDto = {
	generatedAt: string;
	metrics: DashboardMetric[];
};
