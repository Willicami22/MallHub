import { AsyncLocalStorage } from 'node:async_hooks';
import {
	baseLocale,
	extractLocaleFromRequest,
	toLocale,
} from '@/paraglide/runtime.js';

type AppLocale = 'es' | 'en';

const localeContextStorage = new AsyncLocalStorage<AppLocale>();

const resolveLocaleFromRequest = (request: Request): AppLocale => {
	const localeFromHeader = toLocale(request.headers.get('x-paraglide-locale'));

	if (localeFromHeader) {
		return localeFromHeader;
	}

	const localeFromRequest = toLocale(extractLocaleFromRequest(request));
	return localeFromRequest ?? baseLocale;
};

const getLocaleFromAsyncStorage = (): AppLocale =>
	localeContextStorage.getStore() ?? baseLocale;

export {
	getLocaleFromAsyncStorage,
	localeContextStorage,
	resolveLocaleFromRequest,
};
