import { subDays } from 'date-fns';
import { z } from 'zod';
import {
	getAggregatedKpis,
	getDefaultMallId,
	getStoresByMallId,
} from '@/features/.server/mock-db/admin-cc.mock';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';

const generateAiReportInput = z
	.object({
		periodDays: z.number().int().positive().default(30),
	})
	.optional();

const generateAiReportOutput = z.object({
	summary: z.string(),
	insights: z.array(z.string()),
	alerts: z.array(z.string()),
	recommendations: z.array(z.string()),
});

export const generateAiReportMutation = procedures.adminCc
	.input(generateAiReportInput)
	.output(generateAiReportOutput)
	.mutation(async ({ ctx, input }) => {
		// Simulate AI processing time
		await new Promise((resolve) => setTimeout(resolve, 1200));

		const mallId = ctx.user?.preferredMallId ?? getDefaultMallId();
		const _locale = getLocaleFromAsyncStorage();
		const periodDays = input?.periodDays ?? 30;

		// Get KPI data for analysis
		const endDate = new Date();
		const startDate = subDays(endDate, periodDays);
		const kpis = getAggregatedKpis(mallId, startDate, endDate);

		// Get stores
		const stores = getStoresByMallId(mallId);
		const activeStores = stores.filter(
			(s) => s.status === 'APPROVED' || s.status === 'ACTIVE',
		).length;

		// Generate dynamic insights and alerts based on data
		const insights: string[] = [];
		const alerts: string[] = [];
		const recommendations: string[] = [];

		// INSIGHTS
		insights.push(
			`En los últimos ${periodDays} días, tu centro comercial registró ${kpis.totalVisits.toLocaleString()} visitantes.`,
		);

		const avgDailyVisits = Math.floor(kpis.totalVisits / periodDays);
		insights.push(
			`Promedio diario: ${avgDailyVisits.toLocaleString()} visitantes.`,
		);

		if (kpis.conversionRate > 10) {
			insights.push(
				`Tu tasa de conversión es excelente (${kpis.conversionRate.toFixed(2)}%).`,
			);
		} else if (kpis.conversionRate < 5) {
			insights.push(
				`Tu tasa de conversión es baja (${kpis.conversionRate.toFixed(2)}%).`,
			);
		}

		insights.push(
			`Actualmente tienes ${activeStores} tienda(s) activas aprobadas.`,
		);

		// ALERTS
		if (kpis.totalVisits < 5000) {
			alerts.push(
				'⚠️ Tráfico bajo: Considera campañas de promoción para atraer más visitantes.',
			);
		}

		if (activeStores < 3) {
			alerts.push(
				'⚠️ Pocas tiendas activas: Acelera las aprobaciones de solicitudes pendientes.',
			);
		}

		const pendingStores = stores.filter((s) => s.status === 'PENDING').length;
		if (pendingStores > 0) {
			alerts.push(
				`📋 Tienes ${pendingStores} solicitud(es) de tienda pendiente(s) de revisión.`,
			);
		}

		// RECOMMENDATIONS
		if (kpis.conversionRate < 15) {
			recommendations.push(
				'Mejora la experiencia de usuario en tu aplicativo para aumentar conversiones.',
			);
		}

		recommendations.push(
			'Considera eventos especiales durante fines de semana para maximizar tráfico.',
		);

		if (activeStores < 5) {
			recommendations.push(
				'Reclutar nuevas marcas para ampliar la oferta de tu centro comercial.',
			);
		}

		recommendations.push(
			'Revisa las métricas detalladas en el dashboard para identificar patrones.',
		);

		// SUMMARY
		const summary = `Análisis de tu centro comercial para los últimos ${periodDays} días. Se registraron ${kpis.totalVisits.toLocaleString()} visitantes con una tasa de conversión de ${kpis.conversionRate.toFixed(2)}%. Tienes ${activeStores} tienda(s) activa(s) y ${pendingStores} solicitud(es) pendiente(s).`;

		return {
			summary,
			insights,
			alerts,
			recommendations,
		};
	});
