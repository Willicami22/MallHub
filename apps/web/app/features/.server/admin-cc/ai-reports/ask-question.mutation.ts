import { subDays } from 'date-fns';
import { z } from 'zod';
import { chatCompletion } from '@/features/.server/ai/openai.lib';
import { procedures } from '@/features/.server/trpc/trpc.init';
import {
	buildDataContext,
	fetchMallAnalytics,
	resolveMallId,
} from './mall-analytics.service';

const askQuestionInput = z.object({
	question: z.string().min(1).max(500),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
});

const askQuestionOutput = z.object({
	answer: z.string(),
});

export const askQuestionMutation = procedures.adminCc
	.input(askQuestionInput)
	.output(askQuestionOutput)
	.mutation(async ({ ctx, input }) => {
		const { question } = input;
		const endDate = input.endDate ?? new Date();
		const startDate = input.startDate ?? subDays(endDate, 30);

		const mallId = await resolveMallId(ctx.user?.id, ctx.user?.preferredMallId);
		const analytics = await fetchMallAnalytics(mallId, startDate, endDate);

		const systemPrompt = `Eres un asistente de análisis para el administrador del centro comercial "${analytics.mallName}".
Responde preguntas sobre el rendimiento del mall usando ÚNICAMENTE los datos proporcionados.
Si la información solicitada no está en los datos disponibles, indícalo claramente y menciona qué datos sí puedes analizar.
Responde en español, de forma concisa, directa y con datos específicos cuando estén disponibles.
Limita tu respuesta a 300 palabras.`;

		const userPrompt = `Datos disponibles del período ${analytics.periodStart} al ${analytics.periodEnd}:

${buildDataContext(analytics)}

Pregunta del administrador: ${question}`;

		const answer = await chatCompletion({
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			temperature: 0.4,
			max_tokens: 600,
		});

		return { answer };
	});
