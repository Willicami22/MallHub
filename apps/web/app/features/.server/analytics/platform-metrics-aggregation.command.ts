import 'dotenv/config';
import { aggregatePlatformMetricsForRecentDays } from '@/features/.server/analytics/platform-metrics-aggregation.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';

const DEFAULT_LOOKBACK_DAYS = 90;
const LOOKBACK_DAYS_ARG_PREFIX = '--days=';

const parseLookbackDays = (): number => {
	const daysArg = process.argv.find((arg) =>
		arg.startsWith(LOOKBACK_DAYS_ARG_PREFIX),
	);

	if (!daysArg) {
		return DEFAULT_LOOKBACK_DAYS;
	}

	const rawValue = daysArg.slice(LOOKBACK_DAYS_ARG_PREFIX.length).trim();
	const parsedValue = Number.parseInt(rawValue, 10);

	if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
		throw new Error('Invalid --days argument. Expected a positive integer.');
	}

	return parsedValue;
};

const runCommand = async (): Promise<void> => {
	const lookbackDays = parseLookbackDays();
	const result = await aggregatePlatformMetricsForRecentDays(lookbackDays);

	console.log(
		'[analytics.platform-metrics.command] Aggregation completed',
		result,
	);
};

void runCommand()
	.catch((error: unknown) => {
		console.error('[analytics.platform-metrics.command] Aggregation failed', {
			error,
		});
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
