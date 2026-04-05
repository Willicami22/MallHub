import {
	adminAc as adminRoleAccess,
	userAc as userRoleAccess,
} from 'better-auth/plugins/admin/access';
import {
	adminAc as organizationAdminRoleAccess,
	memberAc as organizationMemberRoleAccess,
	ownerAc as organizationOwnerRoleAccess,
} from 'better-auth/plugins/organization/access';

export const appRoles = {
	CUSTOMER: 'CUSTOMER',
	ADMIN_LOCAL: 'ADMIN_LOCAL',
	ADMIN_CC: 'ADMIN_CC',
	ADMIN_PLATFORM: 'ADMIN_PLATFORM',
} as const;

export type AppRole = (typeof appRoles)[keyof typeof appRoles];

export const defaultAppRole: AppRole = appRoles.CUSTOMER;
export const organizationCreatorRole: AppRole = appRoles.ADMIN_PLATFORM;

export const betterAuthAdminRoles = {
	[appRoles.CUSTOMER]: userRoleAccess,
	[appRoles.ADMIN_LOCAL]: userRoleAccess,
	[appRoles.ADMIN_CC]: userRoleAccess,
	[appRoles.ADMIN_PLATFORM]: adminRoleAccess,
} as const;

export const betterAuthOrganizationRoles = {
	[appRoles.CUSTOMER]: organizationMemberRoleAccess,
	[appRoles.ADMIN_LOCAL]: organizationMemberRoleAccess,
	[appRoles.ADMIN_CC]: organizationAdminRoleAccess,
	[appRoles.ADMIN_PLATFORM]: organizationOwnerRoleAccess,
} as const;
