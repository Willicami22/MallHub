import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/features/.server/trpc/trpc.init';
import { appRouter } from '@/features/.server/trpc/trpc.router';
import type { Route } from './+types/trpc.handler';

const handleRequest = (args: Route.LoaderArgs | Route.ActionArgs) => {
	return fetchRequestHandler({
		createContext: createTRPCContext,
		endpoint: '/api/trpc',
		req: args.request,
		router: appRouter,
	});
};

export const loader = (args: Route.LoaderArgs) => handleRequest(args);
export const action = (args: Route.ActionArgs) => handleRequest(args);
