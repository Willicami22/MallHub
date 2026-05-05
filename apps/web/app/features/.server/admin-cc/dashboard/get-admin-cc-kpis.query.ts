import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const getAdminCcKpisInput = z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

const getAdminCcKpisOutput = z.object({
	mallId: z.string(),
	mallName: z.string(),
	hasData: z.boolean(),
	summary: z.object({
		searches: z.number(),
		reservations: z.number(),
		completed: z.number(),
		conversionRate: z.number(),
		activeStores: z.number(),
		searchesChange: z.number().nullable(),
		reservationsChange: z.number().nullable(),
		conversionChange: z.number().nullable(),
	}),
	trends: z.array(
		z.object({
			date: z.string(),
			searches: z.number(),
			reservations: z.number(),
			completed: z.number(),
		}),
	),
	topStores: z.array(
		z.object({
			storeId: z.string(),
			name: z.string(),
			category: z.string().nullable(),
			count: z.number(),
		}),
	),
	topProducts: z.array(
		z.object({
			productId: z.string(),
			name: z.string(),
			storeName: z.string(),
			category: z.string().nullable(),
			count: z.number(),
		}),
	),
	alerts: z.array(
		z.object({
			storeId: z.string(),
			name: z.string(),
			type: z.enum(['OUT_OF_STOCK', 'NO_PRODUCTS']),
			count: z.number(),
		}),
	),
});

export const getAdminCcKpisQuery = procedures.adminCc
	.input(getAdminCcKpisInput)
	.output(getAdminCcKpisOutput)
	.query(async ({ ctx, input }) => {
		const { startDate, endDate } = input;

		// --- Resolve mall ID: preferredMallId → AdminCcAssignment → first active mall ---
		let mallId: string | null = ctx.user?.preferredMallId ?? null;

		if (!mallId && ctx.user?.id) {
			const assignment = await prisma.adminCcAssignment.findFirst({
				where: { adminCcUserId: ctx.user.id },
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

		// --- Previous period: same duration immediately before startDate ---
		const periodMs = endDate.getTime() - startDate.getTime();
		const prevEndDate = new Date(startDate.getTime() - 1);
		const prevStartDate = new Date(prevEndDate.getTime() - periodMs);

		// --- Parallel fetches ---
		const [
			currentMetrics,
			previousMetrics,
			mall,
			topStoresRaw,
			topProductsRaw,
			storesWithProducts,
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
		]);

		// --- Aggregate metrics ---
		const aggregate = (rows: typeof currentMetrics) => ({
			searches: rows.reduce((s, r) => s + r.searchesCount, 0),
			reservations: rows.reduce((s, r) => s + r.reservationsTotal, 0),
			completed: rows.reduce((s, r) => s + r.reservationsCompleted, 0),
			activeStores: rows.length > 0 ? rows[rows.length - 1].activeStores : 0,
		});

		const current = aggregate(currentMetrics);
		const previous = aggregate(previousMetrics);

		const conversionRate =
			current.reservations > 0
				? Math.round((current.completed / current.reservations) * 10000) / 100
				: 0;
		const prevConversionRate =
			previous.reservations > 0
				? Math.round((previous.completed / previous.reservations) * 10000) / 100
				: 0;

		const calcChange = (cur: number, prev: number): number | null =>
			prev === 0 ? null : Math.round(((cur - prev) / prev) * 1000) / 10;

		// --- Enrich top stores ---
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
				name: store?.name ?? 'Unknown',
				category: store?.category ?? null,
				count: r._count.id,
			};
		});

		// --- Enrich top products ---
		const productIds = topProductsRaw.map((r) => r.productId);
		const productDetails =
			productIds.length > 0
				? await prisma.product.findMany({
						where: { id: { in: productIds } },
						select: {
							id: true,
							name: true,
							category: true,
							store: { select: { name: true } },
						},
					})
				: [];
		const productMap = new Map(productDetails.map((p) => [p.id, p]));

		const topProducts = topProductsRaw.map((r) => {
			const product = productMap.get(r.productId);
			return {
				productId: r.productId,
				name: product?.name ?? 'Unknown',
				storeName: product?.store.name ?? 'Unknown',
				category: product?.category ?? null,
				count: r._count.id,
			};
		});

		// --- Alerts: active stores with stock issues ---
		const alerts: {
			storeId: string;
			name: string;
			type: 'OUT_OF_STOCK' | 'NO_PRODUCTS';
			count: number;
		}[] = [];
		for (const store of storesWithProducts) {
			if (store.products.length === 0) {
				alerts.push({
					storeId: store.id,
					name: store.name,
					type: 'NO_PRODUCTS',
					count: 0,
				});
			} else {
				const outOfStock = store.products.filter((p) => p.stock === 0).length;
				if (outOfStock > 0) {
					alerts.push({
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
			mallName: mall?.name ?? '',
			hasData: currentMetrics.length > 0,
			summary: {
				searches: current.searches,
				reservations: current.reservations,
				completed: current.completed,
				conversionRate,
				activeStores: current.activeStores,
				searchesChange: calcChange(current.searches, previous.searches),
				reservationsChange: calcChange(
					current.reservations,
					previous.reservations,
				),
				conversionChange: calcChange(conversionRate, prevConversionRate),
			},
			trends: currentMetrics.map((row) => ({
				date: row.metricDate.toISOString().split('T')[0],
				searches: row.searchesCount,
				reservations: row.reservationsTotal,
				completed: row.reservationsCompleted,
			})),
			topStores,
			topProducts,
			alerts,
		};
	});
