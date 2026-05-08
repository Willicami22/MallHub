import { z } from 'zod';

export const storeConfigSchema = z.object({
	name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
	category: z
		.string()
		.trim()
		.min(2, 'La categoría debe tener al menos 2 caracteres.'),
	floor: z.string().trim().min(1, 'El piso es obligatorio.'),
	localNumber: z.string().trim().min(1, 'El número de local es obligatorio.'),
	openHours: z.string().trim().min(1, 'Los horarios son obligatorios.'),
	logoImageUrl: z
		.string()
		.trim()
		.min(1, 'El logo es obligatorio.')
		.url('Ingresa una URL válida para el logo.'),
	phone: z.string().trim().optional(),
	contactEmail: z
		.union([z.string().email('Correo electrónico inválido.'), z.literal('')])
		.optional(),
	description: z
		.string()
		.max(2000, 'La descripción no puede superar 2000 caracteres.')
		.optional(),
});

export type StoreConfigValues = z.infer<typeof storeConfigSchema>;
