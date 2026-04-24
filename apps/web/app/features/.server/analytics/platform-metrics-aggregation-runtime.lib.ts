import { aggregatePlatformMetricsForRecentDays } from '@/features/.server/analytics/platform-metrics-aggregation.lib';

const METRICS_AGGREGATION_INTERVAL_MS = 60 * 60 * 1000;
const METRICS_AGGREGATION_LOOKBACK_DAYS = 90;

interface PlatformMetricsAggregationRuntime {
	started: boolean;
	shutdownRegistered: boolean;
	isRunning: boolean;
	timer: NodeJS.Timeout | null;
}

const createRuntime = (): PlatformMetricsAggregationRuntime => ({
	started: false,
	shutdownRegistered: false,
	isRunning: false,
	timer: null,
});

const globalForMetricsRuntime = globalThis as typeof globalThis & {
	platformMetricsAggregationRuntime?: PlatformMetricsAggregationRuntime;
};

const runtime =
	globalForMetricsRuntime.platformMetricsAggregationRuntime ?? createRuntime();

if (process.env.NODE_ENV !== 'production') {
	globalForMetricsRuntime.platformMetricsAggregationRuntime = runtime;
}

const runMetricsAggregation = async (): Promise<void> => {
	if (runtime.isRunning) {
		return;
	}

	runtime.isRunning = true;

	try {
		await aggregatePlatformMetricsForRecentDays(
			METRICS_AGGREGATION_LOOKBACK_DAYS,
		);
	} catch (error) {
		console.error('[analytics.platform-metrics.runtime] Aggregation failed', {
			error,
		});
	} finally {
		runtime.isRunning = false;
	}
};

const stopRuntime = (): void => {
	if (runtime.timer) {
		clearInterval(runtime.timer);
		runtime.timer = null;
	}

	runtime.started = false;
};

const startRuntime = (): void => {
	if (runtime.started) {
		return;
	}

	runtime.started = true;
	void runMetricsAggregation();
	runtime.timer = setInterval(() => {
		void runMetricsAggregation();
	}, METRICS_AGGREGATION_INTERVAL_MS);
};

if (!runtime.shutdownRegistered) {
	process.once('SIGTERM', () => {
		stopRuntime();
	});

	process.once('SIGINT', () => {
		stopRuntime();
	});

	runtime.shutdownRegistered = true;
}

export const ensurePlatformMetricsAggregationRuntime = (): void => {
	startRuntime();
};
