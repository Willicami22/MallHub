import { TRPCError } from '@trpc/server';
import { isAPIError } from 'better-auth/api';
import { z } from 'zod';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

const createUserInputSchema = z.object({
	name: z.string().trim().min(1, {
		error: () =>
			m.admin_users_validation_name_required(
				{},
				{ locale: getLocaleFromAsyncStorage() },
			),
	}),
	email: z.email({
		error: () =>
			m.admin_users_validation_email_invalid(
				{},
				{ locale: getLocaleFromAsyncStorage() },
			),
	}),
	password: z
		.string()
		.min(8, {
			error: () =>
				m.admin_users_validation_password_short(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(128),
	role: z.enum([
		appRoles.CUSTOMER,
		appRoles.ADMIN_LOCAL,
		appRoles.ADMIN_CC,
		appRoles.ADMIN_PLATFORM,
	]),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

const createFieldError = (field: string, message: string) =>
	new z.ZodError([{ code: 'custom', path: [field], message }]);

export const createUserMutation = procedures.adminPlatform
	.input(createUserInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();

		try {
			const result = await auth.api.createUser({
				body: {
					name: input.name,
					email: input.email,
					password: input.password,
					role: input.role,
				},
				headers: ctx.headers,
			});

			return { user: result };
		} catch (error) {
			if (isAPIError(error)) {
				const code = error.body?.code;

				if (code === 'USER_ALREADY_EXISTS') {
					throw new TRPCError({
						code: 'CONFLICT',
						message: m.admin_users_create_email_exists({}, { locale }),
						cause: createFieldError(
							'email',
							m.admin_users_create_email_exists({}, { locale }),
						),
					});
				}
			}

			console.error('[trpc.adminUsers.create] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_users_create_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
