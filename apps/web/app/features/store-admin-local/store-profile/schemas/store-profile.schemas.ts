import { z } from 'zod';

export const storeProfileFormSchema = z.object({
	name: z.string().min(2, { error: 'Nombre demasiado corto' }),
	slug: z
		.string()
		.min(2, { error: 'Slug demasiado corto' })
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
			error: 'Solo minúsculas, números y guiones',
		}),
	description: z.string().max(2000, { error: 'Máximo 2000 caracteres' }),
});

export type StoreProfileFormValues = z.infer<typeof storeProfileFormSchema>;

export const promotionFormSchema = z
	.object({
		title: z.string().min(3, { error: 'Título demasiado corto' }),
		discountPercent: z
			.number()
			.min(1, { error: 'Mínimo 1%' })
			.max(90, { error: 'Máximo 90%' }),
		startsAt: z.string().min(1, { error: 'Fecha requerida' }),
		endsAt: z.string().min(1, { error: 'Fecha requerida' }),
	})
	.refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
		message: 'La fecha fin debe ser posterior al inicio',
		path: ['endsAt'],
	});

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
