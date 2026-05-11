import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

const requestPasswordResetInputSchema = z.object({
	email: z.email({
		error: () =>
			m.login_validation_email_invalid(
				{},
				{
					locale: getLocaleFromAsyncStorage(),
				},
			),
	}),
});

export type RequestPasswordResetInput = z.infer<
	typeof requestPasswordResetInputSchema
>;
export type RequestPasswordResetOutput = { status: 'success' };

export const requestPasswordResetMutation = procedures.public
	.input(requestPasswordResetInputSchema)
	.mutation(async ({ ctx, input }): Promise<RequestPasswordResetOutput> => {
		const locale = getLocaleFromAsyncStorage();

		try {
			const user = await prisma.user.findUnique({
				where: { email: input.email },
				select: {
					role: true,
				},
			});

			if (user?.role === appRoles.ADMIN_PLATFORM) {
				await auth.api.requestPasswordReset({
					body: {
						email: input.email,
						redirectTo: localizeHref('/auth/reset-password/confirm', {
							locale,
						}),
					},
					headers: ctx.headers,
				});
			}

			return { status: 'success' };
		} catch (error) {
			console.error('[trpc.auth.requestPasswordReset] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.auth_reset_password_request_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
