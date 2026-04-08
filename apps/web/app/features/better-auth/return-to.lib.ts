export const RETURN_TO_QUERY_PARAM = 'returnTo';

const DUMMY_ORIGIN = 'http://localhost';

const toRelativeHref = (url: URL): string =>
	`${url.pathname}${url.search}${url.hash}`;

export const withReturnTo = (
	href: string,
	returnTo: string | null | undefined,
): string => {
	if (!returnTo) {
		return href;
	}

	const localizedUrl = new URL(href, DUMMY_ORIGIN);
	localizedUrl.searchParams.set(RETURN_TO_QUERY_PARAM, returnTo);

	if (href.startsWith('/')) {
		return toRelativeHref(localizedUrl);
	}

	return localizedUrl.href;
};
