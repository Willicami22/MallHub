import { z } from 'zod';

const variantSchema = z.object({
	id: z.string().optional(),
	sku: z.string().min(1, { error: 'SKU requerido' }),
	label: z.string().min(1, { error: 'Etiqueta requerida' }),
	priceCents: z.number().int().min(0, { error: 'Precio inválido' }),
	stock: z.number().int().min(0, { error: 'Stock inválido' }),
});

export const productFormSchema = z.object({
	name: z.string().min(2, { error: 'Nombre demasiado corto' }),
	description: z
		.string()
		.max(2000, { error: 'Descripción muy larga' })
		.optional(),
	basePriceCents: z.number().int().min(0, { error: 'Precio base inválido' }),
	isPublished: z.boolean(),
	variants: z
		.array(variantSchema)
		.min(1, { error: 'Añade al menos una variante' }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
