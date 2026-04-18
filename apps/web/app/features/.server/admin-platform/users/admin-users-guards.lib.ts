import { TRPCError } from '@trpc/server';
import type {
	Prisma,
	UserRole,
} from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import {
	isAdminPlatformAssignableUserRole,
	isAdminPlatformCreatableUserRole,
	isAdminPlatformProtectedUserRole,
} from '@/features/admin-platform/users/admin-users-policy.lib';
import * as m from '@/paraglide/messages.js';

const ADMIN_MUTATION_TARGET_SELECT = {
	id: true,
	name: true,
	email: true,
	role: true,
	banned: true,
} satisfies Prisma.UserSelect;

export type AdminMutationTargetUser = Prisma.UserGetPayload<{
	select: typeof ADMIN_MUTATION_TARGET_SELECT;
}>;

export const assertAdminPlatformCreatableRoleOrThrow = (
	role: UserRole,
): void => {
	const locale = getLocaleFromAsyncStorage();

	if (!isAdminPlatformCreatableUserRole(role)) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: m.admin_users_create_role_forbidden({}, { locale }),
		});
	}
};

export const assertAdminPlatformAssignableRoleOrThrow = (
	role: UserRole,
): void => {
	const locale = getLocaleFromAsyncStorage();

	if (!isAdminPlatformAssignableUserRole(role)) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: m.admin_users_set_role_forbidden({}, { locale }),
		});
	}
};

export const getSensitiveAdminMutationTargetOrThrow = async ({
	targetUserId,
	actorUserId,
}: {
	targetUserId: string;
	actorUserId: string;
}): Promise<AdminMutationTargetUser> => {
	const locale = getLocaleFromAsyncStorage();
	const targetUser = await prisma.user.findUnique({
		where: { id: targetUserId },
		select: ADMIN_MUTATION_TARGET_SELECT,
	});

	if (!targetUser) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: m.admin_users_target_not_found({}, { locale }),
		});
	}

	if (targetUser.id === actorUserId) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: m.admin_users_self_action_forbidden({}, { locale }),
		});
	}

	if (isAdminPlatformProtectedUserRole(targetUser.role)) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: m.admin_users_target_protected_forbidden({}, { locale }),
		});
	}

	return targetUser;
};
