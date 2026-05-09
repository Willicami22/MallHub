import { z } from 'zod';

const variantSchema = z.object({
	id: z.string().optional(),
	sku: z.string().min(1, { error: 'SKU requerido' }),
	label: z.string().min(1, { error: 'Etiqueta requerida' }),
	priceCents: z.number().int().min(0, { error: 'Precio en COP inválido' }),
	stock: z.number().int().min(0, { error: 'Stock inválido' }),
});

const imageSchema = z.object({
	url: z.string().trim().url({ error: 'URL de imagen inválida' }),
});

export const productFormSchema = z.object({
	name: z.string().min(2, { error: 'Nombre demasiado corto' }),
	category: z
		.string()
		.max(120, { error: 'Categoría demasiado larga' })
		.optional(),
	status: z.enum(['draft', 'active', 'inactive', 'archived']),
	priceDiscountCents: z
		.number()
		.int()
		.min(0, { error: 'Descuento en COP inválido' }),
	isReservable: z.boolean(),
	images: z.array(imageSchema).min(1, { error: 'Añade al menos una imagen' }),
	description: z
		.string()
		.max(2000, { error: 'Descripción muy larga' })
		.optional(),
	basePriceCents: z
		.number()
		.int()
		.min(0, { error: 'Precio base en COP inválido' }),
	isPublished: z.boolean(),
	variants: z
		.array(variantSchema)
		.min(1, { error: 'Añade al menos una variante' }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
