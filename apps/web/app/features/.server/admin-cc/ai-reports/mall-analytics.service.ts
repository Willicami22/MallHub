import { TRPCError } from '@trpc/server';
import { prisma } from '@/features/.server/prisma/prisma.server';

export type MallAnalyticsData = {
	mallId: string;
	mallName: string;
	hasData: boolean;
	daysWithData: number;
	periodStart: string;
	periodEnd: string;
	current: {
		searches: number;
		reservations: number;
		completed: number;
		activeStores: number;
		conversionRate: number;
	};
	previous: {
		searches: number;
		reservations: number;
		completed: number;
		activeStores: number;
		conversionRate: number;
	};
	changes: {
		searches: number | null;
		reservations: number | null;
		conversion: number | null;
	};
	trends: Array<{
		date: string;
		searches: number;
		reservations: number;
		completed: number;
	}>;
	topStores: Array<{
		storeId: string;
		name: string;
		category: string | null;
		count: number;
	}>;
	topProducts: Array<{
		productId: string;
		name: string;
		storeName: string;
		count: number;
	}>;
	stockAlerts: Array<{
		storeId: string;
		name: string;
		type: 'OUT_OF_STOCK' | 'NO_PRODUCTS';
		count: number;
	}>;
	pendingRegistrations: number;
	activeEvents: Array<{
		name: string;
		startDate: string;
		endDate: string;
	}>;
};

export async function resolveMallId(
	userId: string | undefined,
	preferredMallId: string | null | undefined,
): Promise<string> {
	let mallId: string | null = preferredMallId ?? null;

	if (!mallId && userId) {
		const assignment = await prisma.adminCcAssignment.findFirst({
			where: { adminCcUserId: userId },
			select: { mallId: true },
		});
		mallId = assignment?.mallId ?? null;
	}

	if (!mallId) {
		const firstMall = await prisma.mall.findFirst({
			where: { status: 'ACTIVE' },
			select: { id: true },
			orderBy: { createdAt: 'asc' },
		});
		mallId = firstMall?.id ?? null;
	}

	if (!mallId) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'No mall assigned to this user',
		});
	}

	return mallId;
}

export async function fetchMallAnalytics(
	mallId: string,
	startDate: Date,
	endDate: Date,
): Promise<MallAnalyticsData> {
	const periodMs = endDate.getTime() - startDate.getTime();
	const prevEndDate = new Date(startDate.getTime() - 1);
	const prevStartDate = new Date(prevEndDate.getTime() - periodMs);

	const [
		currentMetrics,
		previousMetrics,
		mall,
		topStoresRaw,
		topProductsRaw,
		storesWithProducts,
		pendingCount,
		activeEvents,
	] = await Promise.all([
		prisma.dailyMallMetric.findMany({
			where: { mallId, metricDate: { gte: startDate, lte: endDate } },
			orderBy: { metricDate: 'asc' },
		}),
		prisma.dailyMallMetric.findMany({
			where: { mallId, metricDate: { gte: prevStartDate, lte: prevEndDate } },
		}),
		prisma.mall.findUnique({
			where: { id: mallId },
			select: { name: true },
		}),
		prisma.reservation.groupBy({
			by: ['storeId'],
			where: { mallId, requestedAt: { gte: startDate, lte: endDate } },
			_count: { id: true },
			orderBy: { _count: { id: 'desc' } },
			take: 5,
		}),
		prisma.reservation.groupBy({
			by: ['productId'],
			where: { mallId, requestedAt: { gte: startDate, lte: endDate } },
			_count: { id: true },
			orderBy: { _count: { id: 'desc' } },
			take: 5,
		}),
		prisma.store.findMany({
			where: { mallId, status: 'ACTIVE' },
			select: {
				id: true,
				name: true,
				products: {
					where: { status: 'ACTIVE' },
					select: { stock: true },
				},
			},
		}),
		prisma.storeRegistrationRequest.count({
			where: { mallId, status: 'PENDING' },
		}),
		prisma.mallEvent.findMany({
			where: {
				mallId,
				status: 'PUBLISHED',
				startDate: { lte: endDate },
				endDate: { gte: startDate },
			},
			select: { name: true, startDate: true, endDate: true },
			take: 10,
		}),
	]);

	const aggregate = (rows: typeof currentMetrics) => ({
		searches: rows.reduce((s, r) => s + r.searchesCount, 0),
		reservations: rows.reduce((s, r) => s + r.reservationsTotal, 0),
		completed: rows.reduce((s, r) => s + r.reservationsCompleted, 0),
		activeStores: rows.length > 0 ? rows[rows.length - 1].activeStores : 0,
	});

	const curAgg = aggregate(currentMetrics);
	const prevAgg = aggregate(previousMetrics);

	const conversionRate =
		curAgg.reservations > 0
			? Math.round((curAgg.completed / curAgg.reservations) * 10000) / 100
			: 0;
	const prevConversionRate =
		prevAgg.reservations > 0
			? Math.round((prevAgg.completed / prevAgg.reservations) * 10000) / 100
			: 0;

	const calcChange = (cur: number, prev: number): number | null =>
		prev === 0 ? null : Math.round(((cur - prev) / prev) * 1000) / 10;

	const storeIds = topStoresRaw.map((r) => r.storeId);
	const storeDetails =
		storeIds.length > 0
			? await prisma.store.findMany({
					where: { id: { in: storeIds } },
					select: { id: true, name: true, category: true },
				})
			: [];
	const storeMap = new Map(storeDetails.map((s) => [s.id, s]));

	const topStores = topStoresRaw.map((r) => {
		const store = storeMap.get(r.storeId);
		return {
			storeId: r.storeId,
			name: store?.name ?? 'Desconocida',
			category: store?.category ?? null,
			count: r._count.id,
		};
	});

	const productIds = topProductsRaw.map((r) => r.productId);
	const productDetails =
		productIds.length > 0
			? await prisma.product.findMany({
					where: { id: { in: productIds } },
					select: {
						id: true,
						name: true,
						store: { select: { name: true } },
					},
				})
			: [];
	const productMap = new Map(productDetails.map((p) => [p.id, p]));

	const topProducts = topProductsRaw.map((r) => {
		const product = productMap.get(r.productId);
		return {
			productId: r.productId,
			name: product?.name ?? 'Desconocido',
			storeName: product?.store.name ?? 'Desconocida',
			count: r._count.id,
		};
	});

	const stockAlerts: MallAnalyticsData['stockAlerts'] = [];
	for (const store of storesWithProducts) {
		if (store.products.length === 0) {
			stockAlerts.push({
				storeId: store.id,
				name: store.name,
				type: 'NO_PRODUCTS',
				count: 0,
			});
		} else {
			const outOfStock = store.products.filter((p) => p.stock === 0).length;
			if (outOfStock > 0) {
				stockAlerts.push({
					storeId: store.id,
					name: store.name,
					type: 'OUT_OF_STOCK',
					count: outOfStock,
				});
			}
		}
	}

	return {
		mallId,
		mallName: mall?.name ?? 'Centro Comercial',
		hasData: currentMetrics.length > 0,
		daysWithData: currentMetrics.length,
		periodStart: startDate.toISOString().split('T')[0],
		periodEnd: endDate.toISOString().split('T')[0],
		current: { ...curAgg, conversionRate },
		previous: { ...prevAgg, conversionRate: prevConversionRate },
		changes: {
			searches: calcChange(curAgg.searches, prevAgg.searches),
			reservations: calcChange(curAgg.reservations, prevAgg.reservations),
			conversion: calcChange(conversionRate, prevConversionRate),
		},
		trends: currentMetrics.map((row) => ({
			date: row.metricDate.toISOString().split('T')[0],
			searches: row.searchesCount,
			reservations: row.reservationsTotal,
			completed: row.reservationsCompleted,
		})),
		topStores,
		topProducts,
		stockAlerts,
		pendingRegistrations: pendingCount,
		activeEvents: activeEvents.map((e) => ({
			name: e.name,
			startDate: e.startDate.toISOString().split('T')[0],
			endDate: e.endDate.toISOString().split('T')[0],
		})),
	};
}

export function buildDataContext(analytics: MallAnalyticsData): string {
	const lines: string[] = [];

	lines.push(
		`Período: ${analytics.periodStart} al ${analytics.periodEnd} (${analytics.daysWithData} días con datos)`,
	);
	lines.push('\nMÉTRICAS ACTUALES:');
	lines.push(
		`- Búsquedas totales: ${analytics.current.searches.toLocaleString('es')}`,
	);
	lines.push(
		`- Reservas totales: ${analytics.current.reservations.toLocaleString('es')}`,
	);
	lines.push(
		`- Reservas completadas: ${analytics.current.completed.toLocaleString('es')}`,
	);
	lines.push(
		`- Tasa de conversión: ${analytics.current.conversionRate.toFixed(2)}%`,
	);
	lines.push(`- Tiendas activas: ${analytics.current.activeStores}`);

	lines.push('\nCOMPARACIÓN CON PERÍODO ANTERIOR:');
	lines.push(
		`- Búsquedas anteriores: ${analytics.previous.searches.toLocaleString('es')} (${formatChange(analytics.changes.searches)})`,
	);
	lines.push(
		`- Reservas anteriores: ${analytics.previous.reservations.toLocaleString('es')} (${formatChange(analytics.changes.reservations)})`,
	);
	lines.push(
		`- Conversión anterior: ${analytics.previous.conversionRate.toFixed(2)}% (${formatChange(analytics.changes.conversion)})`,
	);

	if (analytics.topStores.length > 0) {
		lines.push('\nTOP TIENDAS POR RESERVAS:');
		for (const store of analytics.topStores) {
			lines.push(
				`- ${store.name} (${store.category ?? 'sin categoría'}): ${store.count} reservas`,
			);
		}
	}

	if (analytics.topProducts.length > 0) {
		lines.push('\nTOP PRODUCTOS POR RESERVAS:');
		for (const product of analytics.topProducts) {
			lines.push(
				`- ${product.name} (${product.storeName}): ${product.count} reservas`,
			);
		}
	}

	if (analytics.stockAlerts.length > 0) {
		lines.push('\nALERTAS DE INVENTARIO:');
		for (const alert of analytics.stockAlerts) {
			if (alert.type === 'NO_PRODUCTS') {
				lines.push(`- ${alert.name}: sin productos activos`);
			} else {
				lines.push(`- ${alert.name}: ${alert.count} producto(s) sin stock`);
			}
		}
	}

	if (analytics.pendingRegistrations > 0) {
		lines.push(
			`\nSOLICITUDES PENDIENTES: ${analytics.pendingRegistrations} registro(s) de tienda(s) pendiente(s)`,
		);
	}

	if (analytics.activeEvents.length > 0) {
		lines.push('\nEVENTOS ACTIVOS EN EL PERÍODO:');
		for (const event of analytics.activeEvents) {
			lines.push(`- ${event.name}: del ${event.startDate} al ${event.endDate}`);
		}
	}

	return lines.join('\n');
}

function formatChange(change: number | null): string {
	if (change === null) return 'sin datos anteriores';
	const sign = change >= 0 ? '+' : '';
	return `${sign}${change}% vs período anterior`;
}
