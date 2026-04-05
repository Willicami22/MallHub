import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, organization } from 'better-auth/plugins';
import { prisma } from '@/features/.server/prisma/prisma.client';
import {
	appRoles,
	betterAuthAdminRoles,
	betterAuthOrganizationRoles,
	defaultAppRole,
	organizationCreatorRole,
} from '@/features/better-auth/better-auth-access-control.lib';

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		admin({
			roles: betterAuthAdminRoles,
			defaultRole: defaultAppRole,
			adminRoles: [appRoles.ADMIN_PLATFORM],
		}),
		organization({
			roles: betterAuthOrganizationRoles,
			creatorRole: organizationCreatorRole,
			allowUserToCreateOrganization: (user) =>
				user.role === appRoles.ADMIN_PLATFORM,
		}),
	],
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
});

export type Session = typeof auth.$Infer.Session;
