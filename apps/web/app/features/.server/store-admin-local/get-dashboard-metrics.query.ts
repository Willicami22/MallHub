import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getDashboardMetricsQuery = procedures.adminLocal
	.input(z.object({ storeId: z.string().trim().min(1) }))
	.query(async ({ input, ctx }) => {
		const { storeId } = input;

		const store = await prisma.store.findUnique({ where: { id: storeId } });
		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new Error('Tienda no encontrada o acceso denegado');
		}

		const since = new Date();
		since.setDate(since.getDate() - 30);

		const ordersCount = await prisma.reservation.count({
			where: { storeId, status: 'COMPLETED', confirmedAt: { gte: since } },
		});

		const revenueRaw = await prisma.reservation.aggregate({
			_sum: { quantity: true },
			where: { storeId, status: 'COMPLETED', confirmedAt: { gte: since } },
		});

		const activeListings = await prisma.product.count({
			where: { storeId, status: 'ACTIVE' },
		});

		return {
			generatedAt: new Date().toISOString(),
			metrics: [
				{
					key: 'revenueCents',
					label: 'Ingresos (30d)',
					value: `$${((revenueRaw._sum.quantity ?? 0) * 10).toFixed(2)}`,
					hint: 'Pedidos completados',
					deltaLabel: '',
				},
				{
					key: 'orders',
					label: 'Pedidos',
					value: String(ordersCount),
					hint: 'Ventana móvil',
					deltaLabel: '',
				},
				{
					key: 'conversionRate',
					label: 'Conversión',
					value: 'N/A',
					hint: 'Visitas → reserva',
					deltaLabel: '',
				},
				{
					key: 'activeListings',
					label: 'Publicaciones activas',
					value: String(activeListings),
					hint: 'SKU publicados',
					deltaLabel: '',
				},
			],
		};
	});
