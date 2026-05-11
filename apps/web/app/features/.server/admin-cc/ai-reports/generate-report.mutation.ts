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

const generateReportInput = z
	.object({
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().optional(),
	})
	.optional();

const generateReportOutput = z.object({
	mallName: z.string(),
	periodStart: z.string(),
	periodEnd: z.string(),
	hasData: z.boolean(),
	dataWarning: z.string().nullable(),
	summary: z.string(),
	trends: z.string(),
	insights: z.array(z.string()),
	recommendations: z.array(z.string()),
});

export const generateReportMutation = procedures.adminCc
	.input(generateReportInput)
	.output(generateReportOutput)
	.mutation(async ({ ctx, input }) => {
		const endDate = input?.endDate ?? new Date();
		const startDate = input?.startDate ?? subDays(endDate, 30);

		const mallId = await resolveMallId(ctx.user?.id, ctx.user?.preferredMallId);
		const analytics = await fetchMallAnalytics(mallId, startDate, endDate);

		if (!analytics.hasData) {
			return {
				mallName: analytics.mallName,
				periodStart: analytics.periodStart,
				periodEnd: analytics.periodEnd,
				hasData: false,
				dataWarning: `No hay datos disponibles para el período seleccionado (${analytics.periodStart} - ${analytics.periodEnd}). El análisis estará disponible una vez que el mall tenga actividad registrada.`,
				summary: `No se encontraron datos para ${analytics.mallName} en el período del ${analytics.periodStart} al ${analytics.periodEnd}.`,
				trends: 'Datos insuficientes para análisis de tendencias.',
				insights: [
					'No hay suficientes datos para generar insights en este período.',
					'Asegúrate de que el mall esté configurado correctamente.',
					'El análisis completo estará disponible cuando exista actividad registrada.',
				],
				recommendations: [
					'Verifica que las métricas diarias se estén registrando correctamente.',
					'Considera publicar eventos para atraer más actividad al mall.',
				],
			};
		}

		const dataWarning =
			analytics.daysWithData < 7
				? `Análisis basado en ${analytics.daysWithData} día(s) de datos. Para mayor precisión se recomiendan al menos 7 días.`
				: null;

		const systemPrompt = `Eres un experto analista de retail para una plataforma de administración de centros comerciales.
Analiza los datos KPI proporcionados y genera un reporte ejecutivo completo en español.
Sé específico con los números y porcentajes del análisis.
Responde ÚNICAMENTE con JSON válido sin texto adicional.`;

		const userPrompt = `Genera un reporte ejecutivo para el centro comercial "${analytics.mallName}"
para el período del ${analytics.periodStart} al ${analytics.periodEnd}.

${buildDataContext(analytics)}

Responde con este JSON exacto:
{
  "summary": "Resumen ejecutivo de 4-6 oraciones con los hallazgos más importantes incluyendo números específicos",
  "trends": "Análisis de 3-4 oraciones sobre tendencias identificadas comparando con el período anterior, con cifras concretas",
  "insights": ["insight 1 con dato específico", "insight 2", "insight 3", "insight 4", "insight 5"],
  "recommendations": ["recomendación accionable 1", "recomendación 2", "recomendación 3", "recomendación 4"]
}`;

		const rawResponse = await chatCompletion({
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			response_format: { type: 'json_object' },
			temperature: 0.3,
		});

		let parsed: {
			summary?: string;
			trends?: string;
			insights?: string[];
			recommendations?: string[];
		};

		try {
			parsed = JSON.parse(rawResponse);
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'AI response parsing failed',
			});
		}

		return {
			mallName: analytics.mallName,
			periodStart: analytics.periodStart,
			periodEnd: analytics.periodEnd,
			hasData: analytics.hasData,
			dataWarning,
			summary: parsed.summary ?? '',
			trends: parsed.trends ?? '',
			insights: parsed.insights ?? [],
			recommendations: parsed.recommendations ?? [],
		};
	});
