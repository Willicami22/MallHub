import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getDashboardMetricsQuery = procedures.adminLocal
	.input(
		z.object({
			storeId: z.string().trim().min(1),
			period: z.enum(['30d', '90d']).default('30d'),
		}),
	)
	.query(async ({ input, ctx }) => {
		const { storeId, period } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const days = period === '90d' ? 90 : 30;
		const since = new Date();
		since.setDate(since.getDate() - days);

		const [completedCount, activeListings, pendingCount] = await Promise.all([
			prisma.reservation.count({
				where: { storeId, status: 'COMPLETED', confirmedAt: { gte: since } },
			}),
			prisma.product.count({
				where: { storeId, status: 'ACTIVE' },
			}),
			prisma.reservation.count({
				where: { storeId, status: 'PENDING' },
			}),
		]);

		const outOfStockProducts = await prisma.product.findMany({
			where: {
				storeId,
				status: 'ACTIVE',
				OR: [{ isReservable: false }, { stock: { lte: 0 } }],
			},
			select: { id: true, name: true, stock: true, isReservable: true },
			orderBy: { updatedAt: 'desc' },
			take: 20,
		});

		const topProductsRaw = await prisma.reservation.groupBy({
			by: ['productId'],
			where: { storeId, status: 'COMPLETED', confirmedAt: { gte: since } },
			_count: { id: true },
			orderBy: { _count: { id: 'desc' } },
			take: 5,
		});

		let topProducts: { productId: string; name: string; count: number }[] = [];
		if (topProductsRaw.length > 0) {
			const productIds = topProductsRaw.map((r) => r.productId);
			const productDetails = await prisma.product.findMany({
				where: { id: { in: productIds } },
				select: { id: true, name: true },
			});
			topProducts = topProductsRaw.map((r) => ({
				productId: r.productId,
				name:
					productDetails.find((p) => p.id === r.productId)?.name ??
					'Desconocido',
				count: r._count.id,
			}));
		}

		return {
			period,
			generatedAt: new Date().toISOString(),
			completedReservations: completedCount,
			pendingReservations: pendingCount,
			activeListings,
			outOfStockProducts: outOfStockProducts.map((p) => ({
				id: p.id,
				name: p.name,
				stock: p.stock,
				isReservable: p.isReservable,
			})),
			topProducts,
		};
	});
