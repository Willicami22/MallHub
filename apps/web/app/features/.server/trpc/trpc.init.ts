import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import SuperJSON from 'superjson';
import { z } from 'zod';
import {
	type AppAction,
	type AppSubjectType,
	defineAbilityForSessionUser,
} from '@/features/.server/auth/app-ability.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import {
	type AppRole,
	appRoles,
} from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

export const createTRPCContext = async (ctx: FetchCreateContextFnOptions) => {
	const sessionData = await auth.api.getSession({
		headers: ctx.req.headers,
	});
	const { ability, role } = defineAbilityForSessionUser(
		sessionData?.user ?? null,
	);

	return {
		headers: ctx.req.headers,
		resHeaders: ctx.resHeaders,
		session: sessionData?.session ?? null,
		user: sessionData?.user ?? null,
		role,
		ability,
	};
};

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export type TanStackZodError = Record<string, { message: string }>;

const buildZodErrorFromTRPCError = (error: TRPCError): z.ZodError | null => {
	return error.cause instanceof z.ZodError ? error.cause : null;
};

const formatZodToTanStack = (zodError: z.ZodError): TanStackZodError => {
	const fieldErrors: TanStackZodError = {};

	for (const issue of zodError.issues) {
		if (!issue.path.length) {
			continue;
		}

		const path = issue.path.join('.');
		if (!fieldErrors[path]) {
			fieldErrors[path] = { message: issue.message };
		}
	}

	return fieldErrors;
};

export const t = initTRPC.context<TRPCContext>().create({
	transformer: SuperJSON,
	errorFormatter: ({ error, shape }) => {
		const zodError = buildZodErrorFromTRPCError(error);

		return {
			...shape,
			data: {
				...shape.data,
				message: zodError ? zodError.message : shape.message,
				zodError: zodError ? formatZodToTanStack(zodError) : null,
			},
		};
	},
});

const publicProcedure = t.procedure;

const authProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.user || !ctx.role) {
		const locale = getLocaleFromAsyncStorage();
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: m.trpc_error_unauthorized({}, { locale }),
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
			const locale = getLocaleFromAsyncStorage();
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: m.trpc_error_forbidden({}, { locale }),
			});
		}

		return next();
	});

const canProcedure = (action: AppAction, subject: AppSubjectType) =>
	authProcedure.use(({ ctx, next }) => {
		if (ctx.ability.cannot(action, subject)) {
			const locale = getLocaleFromAsyncStorage();
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: m.trpc_error_forbidden({}, { locale }),
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
