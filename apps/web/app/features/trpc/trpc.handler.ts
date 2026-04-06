import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import {
	localeContextStorage,
	resolveLocaleFromRequest,
} from '@/features/.server/trpc/locale.context';
import { createTRPCContext } from '@/features/.server/trpc/trpc.init';
import { appRouter } from '@/features/.server/trpc/trpc.router';
import type { Route } from './+types/trpc.handler';

const handleRequest = (args: Route.LoaderArgs | Route.ActionArgs) => {
	const locale = resolveLocaleFromRequest(args.request);

	return localeContextStorage.run(locale, () =>
		fetchRequestHandler({
			createContext: createTRPCContext,
			endpoint: '/api/trpc',
			onError: ({ error, path }) => {
				if (error.code !== 'INTERNAL_SERVER_ERROR') {
					return;
				}

				console.error('[trpc] Internal server error', {
					path,
					code: error.code,
					message: error.message,
					cause: error.cause,
				});
			},
			req: args.request,
			router: appRouter,
		}),
	);
};

export const loader = (args: Route.LoaderArgs) => handleRequest(args);
export const action = (args: Route.ActionArgs) => handleRequest(args);
