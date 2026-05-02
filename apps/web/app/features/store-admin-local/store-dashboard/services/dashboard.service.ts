import {
	mockLatency,
	shouldMockFail,
} from '@/features/store-admin-local/shared/lib/mock-api.lib';
import { ServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import type { DashboardMetricsDto } from '@/features/store-admin-local/store-dashboard/types/dashboard.types';

export const dashboardService = {
	async getMetrics(storeId: string): Promise<DashboardMetricsDto> {
		await mockLatency(300);
		if (shouldMockFail(`${storeId}@metrics`)) {
			throw new ServiceError(
				'No se pudieron cargar las métricas (simulación).',
				{
					code: 'UNKNOWN',
				},
			);
		}

		return {
			generatedAt: new Date().toISOString(),
			metrics: [
				{
					key: 'revenueCents',
					label: 'Ingresos (30d)',
					value: '$12.4k',
					hint: 'Pedidos completados',
					deltaLabel: '+8% vs mes anterior',
				},
				{
					key: 'orders',
					label: 'Pedidos',
					value: '186',
					hint: 'Ventana móvil',
					deltaLabel: '+3% vs semana previa',
				},
				{
					key: 'conversionRate',
					label: 'Conversión',
					value: '3.2%',
					hint: 'Visitas → reserva',
					deltaLabel: 'Estable',
				},
				{
					key: 'activeListings',
					label: 'Publicaciones activas',
					value: '42',
					hint: 'SKU publicados',
					deltaLabel: '+2 nuevos',
				},
			],
		};
	},
};
