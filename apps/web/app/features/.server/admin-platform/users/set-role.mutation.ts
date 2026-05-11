import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	assertAdminPlatformAssignableRoleOrThrow,
	getSensitiveAdminMutationTargetOrThrow,
} from '@/features/.server/admin-platform/users/admin-users-guards.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES } from '@/features/admin-platform/users/admin-users-policy.lib';
import * as m from '@/paraglide/messages.js';

const setRoleInputSchema = z.object({
	userId: z.string().min(1),
	role: z.enum(ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES),
});

export const setRoleMutation = procedures.adminPlatform
	.input(setRoleInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		assertAdminPlatformAssignableRoleOrThrow(input.role);
		const targetUser = await getSensitiveAdminMutationTargetOrThrow({
			targetUserId: input.userId,
			actorUserId: ctx.user.id,
		});

		if (targetUser.role === input.role) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_users_set_role_same_role({}, { locale }),
			});
		}

		try {
			await auth.api.setRole({
				body: {
					userId: input.userId,
					role: input.role,
				},
				headers: ctx.headers,
			});

			await writeAuditEventBestEffort({
				context: 'trpc.adminUsers.setRole',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_USER_ROLE_UPDATED,
				targetType: 'User',
				targetId: targetUser.id,
				metadata: {
					previousRole: targetUser.role,
					newRole: input.role,
				},
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
