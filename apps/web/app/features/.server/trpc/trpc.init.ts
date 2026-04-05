import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import SuperJSON from 'superjson';
import {
	type AppAction,
	type AppSubjectType,
	defineAbilityForSessionUser,
} from '@/features/.server/auth/app-ability.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import {
	type AppRole,
	appRoles,
} from '@/features/better-auth/better-auth-access-control.lib';

export const createTRPCContext = async (ctx: FetchCreateContextFnOptions) => {
	const sessionData = await auth.api.getSession({
		headers: ctx.req.headers,
	});
	const { ability, role } = defineAbilityForSessionUser(
		sessionData?.user ?? null,
	);

	return {
		session: sessionData?.session ?? null,
		user: sessionData?.user ?? null,
		role,
		ability,
	};
};

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
	transformer: SuperJSON,
});

const publicProcedure = t.procedure;

const authProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.user || !ctx.role) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Unauthorized',
		});
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
			user: ctx.user,
			role: ctx.role,
			ability: ctx.ability,
		},
	});
});

const roleProcedure = (allowedRoles: readonly AppRole[]) =>
	authProcedure.use(({ ctx, next }) => {
		if (!allowedRoles.includes(ctx.role)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Forbidden',
			});
		}

		return next();
	});

const canProcedure = (action: AppAction, subject: AppSubjectType) =>
	authProcedure.use(({ ctx, next }) => {
		if (ctx.ability.cannot(action, subject)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Forbidden',
			});
		}

		return next();
	});

export const procedures = {
	public: publicProcedure,
	auth: authProcedure,
	role: roleProcedure,
	can: canProcedure,
	customer: roleProcedure([appRoles.CUSTOMER]),
	adminLocal: roleProcedure([appRoles.ADMIN_LOCAL]),
	adminCc: roleProcedure([appRoles.ADMIN_CC]),
	adminPlatform: roleProcedure([appRoles.ADMIN_PLATFORM]),
};
