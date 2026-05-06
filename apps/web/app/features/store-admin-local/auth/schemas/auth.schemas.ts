import { z } from 'zod';

export const storeLocalLoginSchema = z.object({
	email: z.email({ error: 'Introduce un correo válido' }),
	password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
});

export type StoreLocalLoginValues = z.infer<typeof storeLocalLoginSchema>;

export const registerStoreSchema = z
	.object({
		mallId: z.string().min(1, { error: 'Selecciona un mall' }),
		storeName: z.string().min(2, { error: 'Nombre demasiado corto' }),
		category: z.string().min(2, { error: 'Categoría demasiado corta' }),
		mail: z.email({ error: 'Correo no válido' }),
		password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
		confirmPassword: z.string(),
		contactPhone: z
			.string()
			.min(7, { error: 'Teléfono demasiado corto' })
			.max(20, { error: 'Teléfono demasiado largo' }),
		description: z
			.string()
			.max(2000, { error: 'Máximo 2000 caracteres' })
			.optional()
			.or(z.literal('')),
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['confirmPassword'],
	});

export type RegisterStoreFormValues = z.infer<typeof registerStoreSchema>;

export const forgotPasswordSchema = z.object({
	email: z.email({ error: 'Introduce un correo válido' }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
