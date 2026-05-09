import { z } from 'zod';

const openHourSchema = z.object({
	day: z.string(),
	open: z.string(),
	close: z.string(),
	closed: z.boolean(),
});

const socialLinkSchema = z.object({
	platform: z.string(),
	url: z.string().url('URL inválida').or(z.literal('')),
});

export const storeProfileFormSchema = z.object({
	name: z.string().min(2, { error: 'Nombre demasiado corto' }),
	description: z.string().max(2000, { error: 'Máximo 2000 caracteres' }),
	logoImageUrl: z.string().min(1, { error: 'El logo es requerido' }),
	bannerImageUrl: z.string().optional().or(z.literal('')),
	openHours: z.array(openHourSchema).optional(),
	socialLinks: z.array(socialLinkSchema).optional(),
});

export type StoreProfileFormValues = z.infer<typeof storeProfileFormSchema>;

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
