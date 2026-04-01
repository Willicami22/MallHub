import { procedures, t } from '@/features/.server/trpc/trpc.init';

export const appRouter = t.router({
	health: procedures.public.query(() => ({ status: 'ok' as const })),
	me: procedures.auth.query(({ ctx }) => ({
		id: ctx.user.id,
		email: ctx.user.email,
		name: ctx.user.name,
	})),
});

export type AppRouter = typeof appRouter;
