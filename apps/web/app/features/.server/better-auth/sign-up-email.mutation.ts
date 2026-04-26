import { TRPCError } from '@trpc/server';
import { isAPIError } from 'better-auth/api';
import { z } from 'zod';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { appendResponseHeaders } from '@/features/.server/better-auth/response-headers.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const signUpEmailInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.register_validation_name_required(
					{},
					{
						locale: getLocaleFromAsyncStorage(),
					},
				),
		}),
	email: z.email({
		error: () =>
			m.register_validation_email_invalid(
				{},
				{
					locale: getLocaleFromAsyncStorage(),
				},
			),
	}),
	password: z
		.string()
		.min(8, {
			error: () =>
				m.register_password_too_short(
					{},
					{
						locale: getLocaleFromAsyncStorage(),
					},
				),
		})
		.max(128, {
			error: () =>
				m.register_password_too_long(
					{},
					{
						locale: getLocaleFromAsyncStorage(),
					},
				),
		}),
	phone: z
		.string()
		.trim()
		.optional()
		.transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type SignUpEmailInput = z.infer<typeof signUpEmailInputSchema>;
export type SignUpEmailOutput = { status: 'success' };

const toApiErrorCode = (error: unknown): string | null => {
	if (!isAPIError(error)) {
		return null;
	}

	return typeof error.body?.code === 'string' ? error.body.code : null;
};

const createFieldError = (
	field: 'name' | 'email' | 'password',
	message: string,
) =>
	new z.ZodError([
		{
			code: 'custom',
			path: [field],
			message,
		},
	]);

const logUnknownSignUpError = ({
	error,
	errorCode,
	email,
}: {
	error: unknown;
	errorCode: string | null;
	email: string;
}) => {
	console.error('[trpc.auth.signUpEmail] Unknown error', {
		email,
		errorCode,
		error,
	});
};

export const signUpEmailMutation = procedures.public
	.input(signUpEmailInputSchema)
	.mutation(async ({ ctx, input }): Promise<SignUpEmailOutput> => {
		const locale = getLocaleFromAsyncStorage();

		try {
			const result = await auth.api.signUpEmail({
				body: input,
				headers: ctx.headers,
				returnHeaders: true,
			});

			appendResponseHeaders(ctx.resHeaders, result.headers);

			return { status: 'success' };
		} catch (error) {
			const errorCode = toApiErrorCode(error);

			if (!errorCode) {
				logUnknownSignUpError({
					error,
					errorCode,
					email: input.email,
				});

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: m.auth_unexpected_error({}, { locale }),
					cause: error instanceof Error ? error : undefined,
				});
			}

			if (errorCode === 'INVALID_EMAIL') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: m.register_validation_email_invalid({}, { locale }),
					cause: createFieldError(
						'email',
						m.register_validation_email_invalid({}, { locale }),
					),
				});
			}

			if (errorCode === 'INVALID_PASSWORD') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: m.register_validation_password_required({}, { locale }),
					cause: createFieldError(
						'password',
						m.register_validation_password_required({}, { locale }),
					),
				});
			}

			if (errorCode === 'PASSWORD_TOO_SHORT') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: m.register_password_too_short({}, { locale }),
					cause: createFieldError(
						'password',
						m.register_password_too_short({}, { locale }),
					),
				});
			}

			if (errorCode === 'PASSWORD_TOO_LONG') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: m.register_password_too_long({}, { locale }),
					cause: createFieldError(
						'password',
						m.register_password_too_long({}, { locale }),
					),
				});
			}

			if (errorCode === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
				throw new TRPCError({
					code: 'CONFLICT',
					message: m.register_email_already_exists({}, { locale }),
					cause: createFieldError(
						'email',
						m.register_email_already_exists({}, { locale }),
					),
				});
			}

			logUnknownSignUpError({
				error,
				errorCode,
				email: input.email,
			});

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.auth_unexpected_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
