const DUMMY_ORIGIN = 'http://localhost';

export const AUTH_REASON_QUERY_PARAM = 'reason';

export const authReasons = {
	ADMIN_SESSION_EXPIRED: 'admin-session-expired',
} as const;

export type AuthReason = (typeof authReasons)[keyof typeof authReasons];

const AUTH_REASON_SET: ReadonlySet<string> = new Set(
	Object.values(authReasons),
);

export const toAuthReason = (
	value: string | null | undefined,
): AuthReason | null => {
	if (!value) {
		return null;
	}

	return AUTH_REASON_SET.has(value) ? (value as AuthReason) : null;
};

const toRelativeHref = (url: URL): string =>
	`${url.pathname}${url.search}${url.hash}`;

export const withAuthReason = (href: string, reason: AuthReason): string => {
	const localizedUrl = new URL(href, DUMMY_ORIGIN);
	localizedUrl.searchParams.set(AUTH_REASON_QUERY_PARAM, reason);

	if (href.startsWith('/')) {
		return toRelativeHref(localizedUrl);
	}

	return localizedUrl.href;
};
