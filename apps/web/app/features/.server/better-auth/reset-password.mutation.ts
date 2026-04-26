import { TRPCError } from '@trpc/server';
import { isAPIError } from 'better-auth/api';
import { z } from 'zod';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

const resetPasswordInputSchema = z.object({
	token: z.string().min(1, {
		error: () =>
			m.auth_reset_password_invalid_token(
				{},
				{ locale: getLocaleFromAsyncStorage() },
			),
	}),
	newPassword: z
		.string()
		.min(8, {
			error: () =>
				m.auth_reset_password_password_too_short(
					{},
					{
						locale: getLocaleFromAsyncStorage(),
					},
				),
		})
		.max(128, {
			error: () =>
				m.auth_reset_password_password_too_long(
					{},
					{
						locale: getLocaleFromAsyncStorage(),
					},
				),
		}),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type ResetPasswordOutput = { status: 'success' };

const createFieldError = (field: 'token' | 'newPassword', message: string) =>
	new z.ZodError([
		{
			code: 'custom',
			path: [field],
			message,
		},
	]);

export const resetPasswordMutation = procedures.public
	.input(resetPasswordInputSchema)
	.mutation(async ({ ctx, input }): Promise<ResetPasswordOutput> => {
		const locale = getLocaleFromAsyncStorage();
		const resetPasswordIdentifier = `reset-password:${input.token}`;

		const verification = await prisma.verification.findFirst({
			where: {
				identifier: resetPasswordIdentifier,
			},
			select: {
				value: true,
				expiresAt: true,
			},
		});

		if (!verification || verification.expiresAt < new Date()) {
			const message = m.auth_reset_password_invalid_token({}, { locale });
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message,
				cause: createFieldError('token', message),
			});
		}

		const resetUser = await prisma.user.findUnique({
			where: {
				id: verification.value,
			},
			select: {
				role: true,
			},
		});

		if (!resetUser || resetUser.role !== appRoles.ADMIN_PLATFORM) {
			const message = m.auth_reset_password_invalid_token({}, { locale });
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message,
				cause: createFieldError('token', message),
			});
		}

		try {
			await auth.api.resetPassword({
				body: {
					token: input.token,
					newPassword: input.newPassword,
				},
				headers: ctx.headers,
			});

			await writeAuditEventBestEffort({
				context: 'trpc.auth.resetPassword',
				actorUserId: verification.value,
				action: auditEventActions.ADMIN_PLATFORM_PASSWORD_RESET_COMPLETED,
				targetType: 'User',
				targetId: verification.value,
				metadata: {
					flow: 'admin-platform-password-reset',
				},
			});

			return { status: 'success' };
		} catch (error) {
			if (isAPIError(error)) {
				const code = error.body?.code;

				if (code === 'INVALID_TOKEN') {
					const message = m.auth_reset_password_invalid_token({}, { locale });
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message,
						cause: createFieldError('token', message),
					});
				}

				if (code === 'PASSWORD_TOO_SHORT') {
					const message = m.auth_reset_password_password_too_short(
						{},
						{ locale },
					);
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message,
						cause: createFieldError('newPassword', message),
					});
				}

				if (code === 'PASSWORD_TOO_LONG') {
					const message = m.auth_reset_password_password_too_long(
						{},
						{ locale },
					);
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message,
						cause: createFieldError('newPassword', message),
					});
				}
			}

			console.error('[trpc.auth.resetPassword] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.auth_reset_password_confirm_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
