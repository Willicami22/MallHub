import { z } from 'zod';

export const promotionFormSchema = z
	.object({
		title: z.string().min(3, { error: 'Título demasiado corto' }),
		description: z
			.string()
			.max(2000, { error: 'Máximo 2000 caracteres' })
			.optional(),
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
