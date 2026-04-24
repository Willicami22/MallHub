import {
	MallStatus,
	ReservationStatus,
	StoreStatus,
	UserRole,
} from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const toUtcDateOnly = (date: Date): Date =>
	new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);

const shiftDateByDays = (date: Date, days: number): Date =>
	new Date(date.getTime() + days * MILLISECONDS_PER_DAY);

const toIsoDay = (date: Date): string => date.toISOString().slice(0, 10);

const enumerateUtcDates = (startDate: Date, endDate: Date): Date[] => {
	const result: Date[] = [];
	let cursor = toUtcDateOnly(startDate);
	const normalizedEndDate = toUtcDateOnly(endDate);

	while (cursor.getTime() <= normalizedEndDate.getTime()) {
		result.push(cursor);
		cursor = shiftDateByDays(cursor, 1);
	}

	return result;
};

const assertValidDateRange = (startDate: Date, endDate: Date): void => {
	if (startDate.getTime() > endDate.getTime()) {
		throw new Error('Invalid metrics aggregation date range');
	}
};

export interface AggregatePlatformMetricsInput {
	startDate: Date;
	endDate: Date;
}

export interface AggregatePlatformMetricsResult {
	startDate: string;
	endDate: string;
	processedDays: number;
	platformRowsWritten: number;
	mallRowsWritten: number;
}

export const getUtcDateRangeForRecentDays = (
	days: number,
): { startDate: Date; endDate: Date } => {
	const normalizedDays = Number.isInteger(days) && days > 0 ? days : 1;
	const endDate = toUtcDateOnly(new Date());
	const startDate = shiftDateByDays(endDate, -(normalizedDays - 1));

	return {
		startDate,
		endDate,
	};
};

export const aggregatePlatformMetricsForDateRange = async ({
	startDate,
	endDate,
}: AggregatePlatformMetricsInput): Promise<AggregatePlatformMetricsResult> => {
	const normalizedStartDate = toUtcDateOnly(startDate);
	const normalizedEndDate = toUtcDateOnly(endDate);

	assertValidDateRange(normalizedStartDate, normalizedEndDate);

	const [malls, activeStoresByMallRaw, activeCustomers] = await Promise.all([
		prisma.mall.findMany({
			select: {
				id: true,
				status: true,
			},
		}),
		prisma.store.groupBy({
			by: ['mallId'],
			where: {
				status: StoreStatus.ACTIVE,
			},
			_count: {
				_all: true,
			},
		}),
		prisma.user.count({
			where: {
				role: UserRole.CUSTOMER,
				OR: [{ banned: false }, { banned: null }],
			},
		}),
	]);

	const activeStoresByMall = new Map(
		activeStoresByMallRaw.map((item) => [item.mallId, item._count._all]),
	);
	const activeMalls = malls.filter(
		(mall) => mall.status === MallStatus.ACTIVE,
	).length;
	const activeStoresTotal = [...activeStoresByMall.values()].reduce(
		(total, count) => total + count,
		0,
	);

	const metricDates = enumerateUtcDates(normalizedStartDate, normalizedEndDate);
	let mallRowsWritten = 0;

	for (const metricDate of metricDates) {
		const windowStart = metricDate;
		const windowEnd = shiftDateByDays(metricDate, 1);

		const [searchesByMallRaw, reservationsByMallRaw, completedByMallRaw] =
			await Promise.all([
				prisma.searchLog.groupBy({
					by: ['mallId'],
					where: {
						createdAt: {
							gte: windowStart,
							lt: windowEnd,
						},
					},
					_count: {
						_all: true,
					},
				}),
				prisma.reservation.groupBy({
					by: ['mallId'],
					where: {
						requestedAt: {
							gte: windowStart,
							lt: windowEnd,
						},
					},
					_count: {
						_all: true,
					},
				}),
				prisma.reservation.groupBy({
					by: ['mallId'],
					where: {
						status: ReservationStatus.COMPLETED,
						completedAt: {
							gte: windowStart,
							lt: windowEnd,
						},
					},
					_count: {
						_all: true,
					},
				}),
			]);

		const searchesByMall = new Map(
			searchesByMallRaw.map((item) => [item.mallId, item._count._all]),
		);
		const reservationsByMall = new Map(
			reservationsByMallRaw.map((item) => [item.mallId, item._count._all]),
		);
		const completedByMall = new Map(
			completedByMallRaw.map((item) => [item.mallId, item._count._all]),
		);

		const searchesCount = [...searchesByMall.values()].reduce(
			(total, count) => total + count,
			0,
		);
		const reservationsTotal = [...reservationsByMall.values()].reduce(
			(total, count) => total + count,
			0,
		);
		const reservationsCompleted = [...completedByMall.values()].reduce(
			(total, count) => total + count,
			0,
		);

		const mallMetricsRows = malls.map((mall) => ({
			mallId: mall.id,
			metricDate,
			searchesCount: searchesByMall.get(mall.id) ?? 0,
			reservationsTotal: reservationsByMall.get(mall.id) ?? 0,
			reservationsCompleted: completedByMall.get(mall.id) ?? 0,
			activeStores: activeStoresByMall.get(mall.id) ?? 0,
		}));

		await prisma.$transaction(async (tx) => {
			await tx.dailyMallMetric.deleteMany({
				where: {
					metricDate,
				},
			});

			if (mallMetricsRows.length > 0) {
				await tx.dailyMallMetric.createMany({
					data: mallMetricsRows,
				});
			}

			await tx.dailyPlatformMetric.upsert({
				where: {
					metricDate,
				},
				create: {
					metricDate,
					activeMalls,
					activeStores: activeStoresTotal,
					activeCustomers,
					searchesCount,
					reservationsTotal,
					reservationsCompleted,
				},
				update: {
					activeMalls,
					activeStores: activeStoresTotal,
					activeCustomers,
					searchesCount,
					reservationsTotal,
					reservationsCompleted,
				},
			});
		});

		mallRowsWritten += mallMetricsRows.length;
	}

	return {
		startDate: toIsoDay(normalizedStartDate),
		endDate: toIsoDay(normalizedEndDate),
		processedDays: metricDates.length,
		platformRowsWritten: metricDates.length,
		mallRowsWritten,
	};
};

export const aggregatePlatformMetricsForRecentDays = async (
	days: number,
): Promise<AggregatePlatformMetricsResult> => {
	const dateRange = getUtcDateRangeForRecentDays(days);
	return aggregatePlatformMetricsForDateRange(dateRange);
};
