import { TRPCError } from '@trpc/server';
import { isAPIError } from 'better-auth/api';
import { z } from 'zod';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const signInEmailInputSchema = z.object({
	email: z.email({
		error: () =>
			m.login_validation_email_invalid(
				{},
				{
					locale: getLocaleFromAsyncStorage(),
				},
			),
	}),
	password: z.string().min(1, {
		error: () =>
			m.login_validation_password_required(
				{},
				{
					locale: getLocaleFromAsyncStorage(),
				},
			),
	}),
});

export type SignInEmailInput = z.infer<typeof signInEmailInputSchema>;
export type SignInEmailOutput = { status: 'success' };

const appendResponseHeaders = (
	targetHeaders: Headers,
	sourceHeaders: Headers,
): void => {
	sourceHeaders.forEach((value, key) => {
		if (key.toLowerCase() === 'set-cookie') {
			targetHeaders.append(key, value);
			return;
		}

		targetHeaders.set(key, value);
	});
};

const toApiErrorCode = (error: unknown): string | null => {
	if (!isAPIError(error)) {
		return null;
	}

	return typeof error.body?.code === 'string' ? error.body.code : null;
};

const createFieldError = (field: 'email' | 'password', message: string) =>
	new z.ZodError([
		{
			code: 'custom',
			path: [field],
			message,
		},
	]);

const logUnknownSignInError = ({
	error,
	errorCode,
	email,
}: {
	error: unknown;
	errorCode: string | null;
	email: string;
}) => {
	console.error('[trpc.auth.signInEmail] Unknown error', {
		email,
		errorCode,
		error,
	});
};

export const signInEmailMutation = procedures.public
	.input(signInEmailInputSchema)
	.mutation(async ({ ctx, input }): Promise<SignInEmailOutput> => {
		const locale = getLocaleFromAsyncStorage();

		try {
			const result = await auth.api.signInEmail({
				body: input,
				headers: ctx.headers,
				returnHeaders: true,
			});

			appendResponseHeaders(ctx.resHeaders, result.headers);

			return { status: 'success' };
		} catch (error) {
			const errorCode = toApiErrorCode(error);

			if (!errorCode) {
				logUnknownSignInError({
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
					message: m.login_validation_email_invalid({}, { locale }),
					cause: createFieldError(
						'email',
						m.login_validation_email_invalid({}, { locale }),
					),
				});
			}

			if (errorCode === 'INVALID_EMAIL_OR_PASSWORD') {
				const message = m.login_invalid_credentials({}, { locale });
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message,
					cause: new z.ZodError([
						{ code: 'custom', path: ['email'], message },
						{ code: 'custom', path: ['password'], message },
					]),
				});
			}

			if (errorCode === 'EMAIL_NOT_VERIFIED') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: m.login_email_not_verified({}, { locale }),
					cause: createFieldError(
						'email',
						m.login_email_not_verified({}, { locale }),
					),
				});
			}

			logUnknownSignInError({
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
