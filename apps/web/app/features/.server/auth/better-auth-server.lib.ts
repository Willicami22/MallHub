import { createHash } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, organization } from 'better-auth/plugins';
import { serverEnv } from '@/features/.server/env/server-env.lib';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { resolveLocaleFromRequest } from '@/features/.server/trpc/locale.context';
import {
	appRoles,
	betterAuthAdminRoles,
	betterAuthOrganizationRoles,
	defaultAppRole,
	organizationCreatorRole,
} from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';
import { baseLocale } from '@/paraglide/runtime.js';

const resolveNotificationLocale = (request?: Request) => {
	if (!request) {
		return baseLocale;
	}

	return resolveLocaleFromRequest(request);
};

const createNotificationIdempotencyKey = (
	eventType: string,
	email: string,
	url: string,
): string => {
	const digest = createHash('sha256').update(`${email}:${url}`).digest('hex');

	return `${eventType}/${digest}`;
};

const queueVerificationEmail = ({
	email,
	url,
	request,
}: {
	email: string;
	url: string;
	request?: Request;
}): void => {
	const locale = resolveNotificationLocale(request);

	dispatchNotificationEmail({
		to: email,
		subject: m.auth_email_verification_subject({}, { locale }),
		text: m.auth_email_verification_text({ url }, { locale }),
		idempotencyKey: createNotificationIdempotencyKey(
			'auth-email-verification',
			email,
			url,
		),
	});
};

const queueResetPasswordEmail = ({
	email,
	url,
	request,
}: {
	email: string;
	url: string;
	request?: Request;
}): void => {
	const locale = resolveNotificationLocale(request);

	dispatchNotificationEmail({
		to: email,
		subject: m.auth_email_reset_password_subject({}, { locale }),
		text: m.auth_email_reset_password_text({ url }, { locale }),
		idempotencyKey: createNotificationIdempotencyKey(
			'auth-password-reset',
			email,
			url,
		),
	});
};

export const auth = betterAuth({
	baseURL: serverEnv.BETTER_AUTH_URL,
	secret: serverEnv.BETTER_AUTH_SECRET,
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		sendVerificationEmail: async ({ user, url }, request) => {
			queueVerificationEmail({
				email: user.email,
				url,
				request,
			});
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }, request) => {
			queueResetPasswordEmail({
				email: user.email,
				url,
				request,
			});
		},
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
