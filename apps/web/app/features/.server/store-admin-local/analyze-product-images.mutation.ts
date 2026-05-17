import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { chatCompletion } from '@/features/.server/ai/openai.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const variantSuggestionSchema = z.object({
	label: z.string(),
	type: z.enum(['color', 'size', 'other']),
});

const analyzeProductImagesOutput = z.object({
	names: z.array(z.string()).min(1).max(3),
	description: z.string(),
	category: z.string().nullable(),
	categoryConfidence: z.enum(['high', 'medium', 'low']),
	variants: z.array(variantSuggestionSchema),
});

export const analyzeProductImagesMutation = procedures.adminLocal
	.input(
		z.object({
			storeId: z.string().trim().min(1),
			images: z.array(z.string().min(1)).min(1).max(5),
		}),
	)
	.output(analyzeProductImagesOutput)
	.mutation(async ({ input, ctx }) => {
		const store = await prisma.store.findFirst({
			where: { id: input.storeId, ownerUserId: ctx.user.id },
			select: { id: true, name: true, category: true },
		});

		if (!store) {
			throw new TRPCError({ code: 'FORBIDDEN' });
		}

		const imageParts = input.images.map((imageData) => ({
			type: 'image_url' as const,
			image_url: { url: imageData, detail: 'low' as const },
		}));

		const systemPrompt = `Eres un asistente de creación de catálogos para tiendas en centros comerciales colombianos.
Analiza las imágenes del producto y genera contenido descriptivo para el catálogo en español.
Responde ÚNICAMENTE con JSON válido sin texto adicional ni bloques de código.`;

		const storeContext = store.category
			? `"${store.name}" (categoría de tienda: ${store.category})`
			: `"${store.name}"`;

		const userText = `Analiza estas imágenes del producto para la tienda ${storeContext}.

Genera exactamente este JSON:
{
  "names": ["nombre 1", "nombre 2", "nombre 3"],
  "description": "descripción de 1-3 oraciones",
  "category": "categoría o null",
  "categoryConfidence": "high",
  "variants": [{"label": "valor", "type": "color"}]
}

Reglas:
- names: hasta 3 opciones, de más corto a más descriptivo
- description: describe características, materiales o uso visible en el idioma apropiado para una tienda colombiana
- category: categoría del producto (Calzado, Ropa, Accesorios, Hogar, Electrónica, etc.) o null si no es claro
- categoryConfidence: "high" si la categoría es obvia, "medium" si es probable, "low" si es ambigua
- variants: SOLO si claramente visibles en las imágenes (colores distintos, tallas impresas). Si no se ven, devolver []`;

		const rawResponse = await chatCompletion({
			messages: [
				{ role: 'system', content: systemPrompt },
				{
					role: 'user',
					content: [{ type: 'text', text: userText }, ...imageParts],
				},
			],
			model: 'gpt-4o-mini',
			response_format: { type: 'json_object' },
			temperature: 0.4,
			max_tokens: 500,
		});

		let parsed: unknown;
		try {
			parsed = JSON.parse(rawResponse);
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'No se pudo procesar la respuesta de IA.',
			});
		}

		const result = analyzeProductImagesOutput.safeParse(parsed);
		if (!result.success) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'La respuesta de IA no tiene el formato esperado.',
			});
		}

		return result.data;
	});
