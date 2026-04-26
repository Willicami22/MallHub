import { TRPCError } from '@trpc/server';
import { isAPIError } from 'better-auth/api';
import { z } from 'zod';
import { assertAdminPlatformCreatableRoleOrThrow } from '@/features/.server/admin-platform/users/admin-users-guards.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { ADMIN_PLATFORM_CREATABLE_USER_ROLES } from '@/features/admin-platform/users/admin-users-policy.lib';
import * as m from '@/paraglide/messages.js';

const createUserInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, {
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
	role: z.enum(ADMIN_PLATFORM_CREATABLE_USER_ROLES),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

const createFieldError = (field: string, message: string) =>
	new z.ZodError([{ code: 'custom', path: [field], message }]);

const getCreatedUserId = (result: unknown): string | null => {
	if (typeof result !== 'object' || result === null) {
		return null;
	}

	if ('id' in result && typeof result.id === 'string') {
		return result.id;
	}

	if (
		'user' in result &&
		typeof result.user === 'object' &&
		result.user !== null &&
		'id' in result.user &&
		typeof result.user.id === 'string'
	) {
		return result.user.id;
	}

	return null;
};

export const createUserMutation = procedures.adminPlatform
	.input(createUserInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		assertAdminPlatformCreatableRoleOrThrow(input.role);

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

			const createdUserId = getCreatedUserId(result);

			await writeAuditEventBestEffort({
				context: 'trpc.adminUsers.create',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_USER_CREATED,
				targetType: 'User',
				targetId: createdUserId,
				metadata: {
					email: input.email,
					role: input.role,
				},
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
