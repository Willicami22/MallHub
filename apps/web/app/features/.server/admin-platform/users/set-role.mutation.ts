import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

const setRoleInputSchema = z.object({
	userId: z.string().min(1),
	role: z.enum([
		appRoles.CUSTOMER,
		appRoles.ADMIN_LOCAL,
		appRoles.ADMIN_CC,
		appRoles.ADMIN_PLATFORM,
	]),
});

export const setRoleMutation = procedures.adminPlatform
	.input(setRoleInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();

		try {
			await auth.api.setRole({
				body: {
					userId: input.userId,
					role: input.role,
				},
				headers: ctx.headers,
			});

			return { success: true };
		} catch (error) {
			console.error('[trpc.adminUsers.setRole] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_users_set_role_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
