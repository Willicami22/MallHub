import { redirect } from 'react-router';
import {
	auth,
	type Session,
} from '@/features/.server/auth/better-auth-server.lib';
import type { AppRole } from '@/features/better-auth/better-auth-access-control.lib';
import { RETURN_TO_QUERY_PARAM } from '@/features/better-auth/return-to.lib';
import {
	baseLocale,
	deLocalizeHref,
	extractLocaleFromRequest,
	localizeHref,
	toLocale,
} from '@/paraglide/runtime.js';

const DUMMY_ORIGIN = 'http://localhost';
const AUTH_PATHS = ['/auth/login', '/auth/register'] as const;

type SessionData = Session | null;

const toRelativeHref = (url: URL): string =>
	`${url.pathname}${url.search}${url.hash}`;

const resolveLocaleFromRequest = (request: Request) =>
	toLocale(extractLocaleFromRequest(request)) ?? baseLocale;

const toLocalizedHref = (request: Request, href: string): string =>
	localizeHref(href, { locale: resolveLocaleFromRequest(request) });

const isAuthPath = (path: string): boolean =>
	AUTH_PATHS.some(
		(authPath) => path === authPath || path.startsWith(`${authPath}/`),
	);

const sanitizeReturnTo = (value: string | null | undefined): string | null => {
	if (!value || value.startsWith('//')) {
		return null;
	}

	let parsed: URL;
	try {
		parsed = new URL(value, DUMMY_ORIGIN);
	} catch {
		return null;
	}

	if (parsed.origin !== DUMMY_ORIGIN) {
		return null;
	}

	if (!parsed.pathname.startsWith('/')) {
		return null;
	}

	const deLocalizedPathname = deLocalizeHref(parsed.pathname);

	if (
		deLocalizedPathname === '/api' ||
		deLocalizedPathname.startsWith('/api/') ||
		isAuthPath(deLocalizedPathname)
	) {
		return null;
	}

	return toRelativeHref(parsed);
};

const getSessionFromRequest = async (request: Request): Promise<SessionData> =>
	auth.api.getSession({
		headers: request.headers,
	});

const getCurrentRequestReturnTo = (request: Request): string | null =>
	sanitizeReturnTo(toRelativeHref(new URL(request.url)));

const appendReturnTo = (href: string, returnTo: string | null): string => {
	if (!returnTo) {
		return href;
	}

	const localizedUrl = new URL(href, DUMMY_ORIGIN);
	localizedUrl.searchParams.set(RETURN_TO_QUERY_PARAM, returnTo);

	return toRelativeHref(localizedUrl);
};

const getValidatedReturnToFromRequest = (request: Request): string | null =>
	sanitizeReturnTo(
		new URL(request.url).searchParams.get(RETURN_TO_QUERY_PARAM),
	);

const getFallbackAuthenticatedHref = (request: Request): string =>
	toLocalizedHref(request, '/');

const getLoginRedirectHref = (request: Request): string => {
	const loginHref = toLocalizedHref(request, '/auth/login');
	const returnTo = getCurrentRequestReturnTo(request);

	return appendReturnTo(loginHref, returnTo);
};

const resolvePostAuthRedirectHref = (request: Request): string =>
	getValidatedReturnToFromRequest(request) ??
	getFallbackAuthenticatedHref(request);

export const loadGuestOnlyAuthRoute = async (request: Request) => {
	const sessionData = await getSessionFromRequest(request);

	if (sessionData) {
		throw redirect(resolvePostAuthRedirectHref(request));
	}

	return {
		returnTo: getValidatedReturnToFromRequest(request),
	};
};

export const requireAuthenticatedSession = async (
	request: Request,
): Promise<Session> => {
	const sessionData = await getSessionFromRequest(request);

	if (!sessionData) {
		throw redirect(getLoginRedirectHref(request));
	}

	return sessionData;
};

export const requireRoleSession = async (
	request: Request,
	allowedRoles: readonly AppRole[],
): Promise<Session> => {
	const sessionData = await requireAuthenticatedSession(request);
	const userRole = sessionData.user.role;

	if (
		typeof userRole !== 'string' ||
		!allowedRoles.some((allowedRole) => allowedRole === userRole)
	) {
		throw redirect(getFallbackAuthenticatedHref(request));
	}

	return sessionData;
};
