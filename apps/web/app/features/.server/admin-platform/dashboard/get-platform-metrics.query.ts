import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';
import {
	ADMIN_DASHBOARD_PERIOD_DAYS,
	ADMIN_DASHBOARD_PERIOD_OPTIONS,
	type AdminDashboardPeriod,
} from '@/features/admin-platform/dashboard/admin-dashboard-period.lib';

const getPlatformMetricsInputSchema = z.object({
	period: z.enum(ADMIN_DASHBOARD_PERIOD_OPTIONS).default('30d'),
});

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const toUtcDateOnly = (date: Date): Date =>
	new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);

const shiftDateByDays = (date: Date, days: number): Date =>
	new Date(date.getTime() + days * MILLISECONDS_PER_DAY);

const toIsoDay = (date: Date): string => date.toISOString().slice(0, 10);

const getWindow = (period: AdminDashboardPeriod) => {
	const days = ADMIN_DASHBOARD_PERIOD_DAYS[period];
	const endDate = toUtcDateOnly(new Date());
	const startDate = shiftDateByDays(endDate, -(days - 1));

	return {
		days,
		startDate,
		endDate,
	};
};

const EMPTY_METRIC_TOTALS = {
	activeMalls: 0,
	activeStores: 0,
	activeCustomers: 0,
	searchesCount: 0,
	reservationsTotal: 0,
	reservationsCompleted: 0,
};

export const getPlatformMetricsQuery = procedures.adminPlatform
	.input(getPlatformMetricsInputSchema)
	.query(async ({ input }) => {
		const window = getWindow(input.period);
		const [dailyPlatformMetrics, groupedMallMetrics] = await Promise.all([
			prisma.dailyPlatformMetric.findMany({
				where: {
					metricDate: {
						gte: window.startDate,
						lte: window.endDate,
					},
				},
				orderBy: {
					metricDate: 'asc',
				},
				select: {
					metricDate: true,
					activeMalls: true,
					activeStores: true,
					activeCustomers: true,
					searchesCount: true,
					reservationsTotal: true,
					reservationsCompleted: true,
				},
			}),
			prisma.dailyMallMetric.groupBy({
				by: ['mallId'],
				where: {
					metricDate: {
						gte: window.startDate,
						lte: window.endDate,
					},
				},
				_sum: {
					activeStores: true,
					searchesCount: true,
					reservationsTotal: true,
					reservationsCompleted: true,
				},
			}),
		]);

		const latest = dailyPlatformMetrics.at(-1);
		const totals = dailyPlatformMetrics.reduce(
			(acc, metric) => ({
				activeMalls: metric.activeMalls,
				activeStores: metric.activeStores,
				activeCustomers: metric.activeCustomers,
				searchesCount: acc.searchesCount + metric.searchesCount,
				reservationsTotal: acc.reservationsTotal + metric.reservationsTotal,
				reservationsCompleted:
					acc.reservationsCompleted + metric.reservationsCompleted,
			}),
			{ ...EMPTY_METRIC_TOTALS },
		);

		const mallIds = groupedMallMetrics.map((metric) => metric.mallId);
		const malls = mallIds.length
			? await prisma.mall.findMany({
					where: {
						id: {
							in: mallIds,
						},
					},
					select: {
						id: true,
						name: true,
						status: true,
					},
				})
			: [];
		const mallNameById = new Map(
			malls.map((mall) => [mall.id, { name: mall.name, status: mall.status }]),
		);

		const mallBreakdown = groupedMallMetrics
			.map((metric) => ({
				mallId: metric.mallId,
				mallName: mallNameById.get(metric.mallId)?.name ?? metric.mallId,
				mallStatus: mallNameById.get(metric.mallId)?.status ?? 'INACTIVE',
				activeStores: metric._sum.activeStores ?? 0,
				searchesCount: metric._sum.searchesCount ?? 0,
				reservationsTotal: metric._sum.reservationsTotal ?? 0,
				reservationsCompleted: metric._sum.reservationsCompleted ?? 0,
			}))
			.sort((left, right) => right.reservationsTotal - left.reservationsTotal);

		return {
			window: {
				period: input.period,
				days: window.days,
				startDate: toIsoDay(window.startDate),
				endDate: toIsoDay(window.endDate),
			},
			headline: latest
				? {
						activeMalls: latest.activeMalls,
						activeStores: latest.activeStores,
						activeCustomers: latest.activeCustomers,
						reservationsTotal: latest.reservationsTotal,
					}
				: {
						activeMalls: 0,
						activeStores: 0,
						activeCustomers: 0,
						reservationsTotal: 0,
					},
			totals,
			trend: dailyPlatformMetrics.map((metric) => ({
				date: toIsoDay(metric.metricDate),
				activeMalls: metric.activeMalls,
				activeStores: metric.activeStores,
				activeCustomers: metric.activeCustomers,
				searchesCount: metric.searchesCount,
				reservationsTotal: metric.reservationsTotal,
				reservationsCompleted: metric.reservationsCompleted,
			})),
			mallBreakdown,
		};
	});
