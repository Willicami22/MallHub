import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import SuperJSON from 'superjson';
import { auth } from '@/features/.server/auth/better-auth-server.lib';

export const createTRPCContext = async (ctx: FetchCreateContextFnOptions) => {
	const sessionData = await auth.api.getSession({
		headers: ctx.req.headers,
	});

	return {
		session: sessionData?.session ?? null,
		user: sessionData?.user ?? null,
	};
};

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
	transformer: SuperJSON,
});

const publicProcedure = t.procedure;

const authProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Unauthorized',
		});
	}

	return next({
		ctx: {
			session: ctx.session,
			user: ctx.user,
		},
	});
});

export const procedures = {
	public: publicProcedure,
	auth: authProcedure,
};
