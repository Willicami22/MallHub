import { TRPCError } from '@trpc/server';
import { subDays } from 'date-fns';
import { z } from 'zod';
import { chatCompletion } from '@/features/.server/ai/openai.lib';
import { procedures } from '@/features/.server/trpc/trpc.init';
import {
	buildDataContext,
	fetchMallAnalytics,
	resolveMallId,
} from './mall-analytics.service';

const detectAlertsInput = z
	.object({
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().optional(),
	})
	.optional();

const alertSeverity = z.enum(['CRITICAL', 'WARNING', 'INFO']);

const detectAlertsOutput = z.object({
	mallName: z.string(),
	alerts: z.array(
		z.object({
			severity: alertSeverity,
			title: z.string(),
			description: z.string(),
			metric: z.string(),
			impact: z.string(),
			action: z.string(),
			storeId: z.string().nullable(),
		}),
	),
	hasCritical: z.boolean(),
});

export const detectAlertsMutation = procedures.adminCc
	.input(detectAlertsInput)
	.output(detectAlertsOutput)
	.mutation(async ({ ctx, input }) => {
		const endDate = input?.endDate ?? new Date();
		const startDate = input?.startDate ?? subDays(endDate, 30);

		const mallId = await resolveMallId(ctx.user?.id, ctx.user?.preferredMallId);
		const analytics = await fetchMallAnalytics(mallId, startDate, endDate);

		const storeIdContext =
			[
				...analytics.topStores.map((s) => `${s.storeId}=${s.name}`),
				...analytics.stockAlerts.map((s) => `${s.storeId}=${s.name}`),
			].join(', ') || 'ninguna';

		const systemPrompt = `Eres un experto analista de retail para una plataforma de centros comerciales.
Analiza los datos KPI y genera una lista priorizada de alertas en español.
Clasifica cada alerta por severidad:
- CRITICAL: problemas que requieren acción inmediata (caída >15% conversión, tiendas sin stock en top ventas, etc.)
- WARNING: situaciones que pueden empeorar si no se atienden (tendencias negativas, solicitudes pendientes, etc.)
- INFO: oportunidades de mejora o datos a observar
Responde ÚNICAMENTE con JSON válido.`;

		const userPrompt = `Analiza los siguientes datos del centro comercial "${analytics.mallName}"
(período: ${analytics.periodStart} al ${analytics.periodEnd}) y genera alertas accionables:

${buildDataContext(analytics)}

IDs de tiendas disponibles: ${storeIdContext}

Responde con este JSON (el array puede estar vacío si todo está bien):
{
  "alerts": [
    {
      "severity": "CRITICAL" | "WARNING" | "INFO",
      "title": "Título corto y descriptivo",
      "description": "Descripción detallada del hallazgo con datos específicos",
      "metric": "Nombre de la métrica afectada",
      "impact": "Impacto estimado en el negocio",
      "action": "Acción concreta que el administrador puede tomar",
      "storeId": "id-exacto-de-tienda-si-aplica-o-null"
    }
  ]
}`;

		const rawResponse = await chatCompletion({
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			response_format: { type: 'json_object' },
			temperature: 0.2,
		});

		let parsed: {
			alerts?: Array<{
				severity: string;
				title: string;
				description: string;
				metric: string;
				impact: string;
				action: string;
				storeId: string | null;
			}>;
		};

		try {
			parsed = JSON.parse(rawResponse);
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'AI response parsing failed',
			});
		}

		const validSeverities = ['CRITICAL', 'WARNING', 'INFO'];
		const alerts = (parsed.alerts ?? []).map((a) => ({
			severity: (validSeverities.includes(a.severity) ? a.severity : 'INFO') as
				| 'CRITICAL'
				| 'WARNING'
				| 'INFO',
			title: a.title ?? '',
			description: a.description ?? '',
			metric: a.metric ?? '',
			impact: a.impact ?? '',
			action: a.action ?? '',
			storeId: a.storeId ?? null,
		}));

		return {
			mallName: analytics.mallName,
			alerts,
			hasCritical: alerts.some((a) => a.severity === 'CRITICAL'),
		};
	});
