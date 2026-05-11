import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getSensitiveAdminMutationTargetOrThrow } from '@/features/.server/admin-platform/users/admin-users-guards.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const banUserInputSchema = z.object({
	userId: z.string().min(1),
	banReason: z.string().trim().optional(),
});

const unbanUserInputSchema = z.object({
	userId: z.string().min(1),
});

export const banUserMutation = procedures.adminPlatform
	.input(banUserInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const targetUser = await getSensitiveAdminMutationTargetOrThrow({
			targetUserId: input.userId,
			actorUserId: ctx.user.id,
		});

		try {
			await auth.api.banUser({
				body: {
					userId: input.userId,
					banReason: input.banReason,
				},
				headers: ctx.headers,
			});

			await writeAuditEventBestEffort({
				context: 'trpc.adminUsers.ban',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_USER_BANNED,
				targetType: 'User',
				targetId: targetUser.id,
				metadata: {
					reason: input.banReason ?? null,
				},
			});

			return { success: true };
		} catch (error) {
			console.error('[trpc.adminUsers.ban] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_users_ban_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});

export const unbanUserMutation = procedures.adminPlatform
	.input(unbanUserInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const targetUser = await getSensitiveAdminMutationTargetOrThrow({
			targetUserId: input.userId,
			actorUserId: ctx.user.id,
		});

		try {
			await auth.api.unbanUser({
				body: { userId: input.userId },
				headers: ctx.headers,
			});

			await writeAuditEventBestEffort({
				context: 'trpc.adminUsers.unban',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_USER_UNBANNED,
				targetType: 'User',
				targetId: targetUser.id,
			});

			return { success: true };
		} catch (error) {
			console.error('[trpc.adminUsers.unban] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_users_unban_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
