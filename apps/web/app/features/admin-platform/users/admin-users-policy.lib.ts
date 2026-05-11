import type { UserRole } from '@/features/.server/prisma/generated/client';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';

export const ADMIN_PLATFORM_CREATABLE_USER_ROLES = [
	appRoles.ADMIN_CC,
] as const satisfies readonly UserRole[];

export const ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES = [
	appRoles.CUSTOMER,
	appRoles.ADMIN_LOCAL,
	appRoles.ADMIN_CC,
] as const satisfies readonly UserRole[];

export const ADMIN_PLATFORM_PROTECTED_USER_ROLES = [
	appRoles.ADMIN_PLATFORM,
] as const satisfies readonly UserRole[];

type ArrayMember<TItems extends readonly unknown[]> = TItems[number];

export type AdminPlatformCreatableUserRole = ArrayMember<
	typeof ADMIN_PLATFORM_CREATABLE_USER_ROLES
>;

export type AdminPlatformAssignableUserRole = ArrayMember<
	typeof ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES
>;

export const isAdminPlatformCreatableUserRole = (
	role: UserRole,
): role is AdminPlatformCreatableUserRole =>
	ADMIN_PLATFORM_CREATABLE_USER_ROLES.includes(
		role as AdminPlatformCreatableUserRole,
	);

export const isAdminPlatformAssignableUserRole = (
	role: UserRole,
): role is AdminPlatformAssignableUserRole =>
	ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES.includes(
		role as AdminPlatformAssignableUserRole,
	);

export const isAdminPlatformProtectedUserRole = (role: UserRole): boolean =>
	(ADMIN_PLATFORM_PROTECTED_USER_ROLES as readonly UserRole[]).includes(role);
