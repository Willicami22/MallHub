import { z } from 'zod';

export const storeLocalLoginSchema = z.object({
	email: z.email({ error: 'Introduce un correo válido' }),
	password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
});

export type StoreLocalLoginValues = z.infer<typeof storeLocalLoginSchema>;

export const registerStoreSchema = z
	.object({
		storeName: z.string().min(2, { error: 'Nombre demasiado corto' }),
		slug: z
			.string()
			.min(2, { error: 'Slug demasiado corto' })
			.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
				error: 'Solo minúsculas, números y guiones',
			}),
		ownerEmail: z.email({ error: 'Correo no válido' }),
		password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
		confirmPassword: z.string(),
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
