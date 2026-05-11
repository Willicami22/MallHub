import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { appendResponseHeaders } from '@/features/.server/better-auth/response-headers.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const expireAdminSessionInputSchema = z.object({
	currentPath: z.string().trim().min(1).optional(),
});

export const expireAdminSessionMutation = procedures.adminPlatform
	.input(expireAdminSessionInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();

		try {
			const result = await auth.api.signOut({
				headers: ctx.headers,
				returnHeaders: true,
			});

			appendResponseHeaders(ctx.resHeaders, result.headers);

			await writeAuditEventBestEffort({
				context: 'trpc.auth.expireAdminSession',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_PLATFORM_SESSION_EXPIRED,
				targetType: 'Session',
				targetId: ctx.session.id,
				metadata: {
					reason: 'idle-timeout',
					path: input.currentPath ?? null,
				},
			});

			return { status: 'success' as const };
		} catch (error) {
			console.error('[trpc.auth.expireAdminSession] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.auth_session_expire_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
