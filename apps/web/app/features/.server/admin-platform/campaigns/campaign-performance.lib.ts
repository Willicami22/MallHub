export const computeCtr = (impressions: number, clicks: number): number => {
	if (impressions <= 0) {
		return 0;
	}

	return clicks / impressions;
};

export type CampaignMetricSummary = {
	impressions: number;
	clicks: number;
	ctr: number;
};

export const summarizeCampaignMetrics = (
	metrics: Array<{ impressions: number; clicks: number }>,
): CampaignMetricSummary => {
	const impressions = metrics.reduce(
		(total, metric) => total + metric.impressions,
		0,
	);
	const clicks = metrics.reduce((total, metric) => total + metric.clicks, 0);

	return {
		impressions,
		clicks,
		ctr: computeCtr(impressions, clicks),
	};
};
