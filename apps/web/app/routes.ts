import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
	index('features/home/route/home.route.tsx'),
	route('api/trpc/*', 'features/trpc/trpc.handler.ts'),
	route('api/auth/*', 'features/better-auth/better-auth.handler.ts'),
	route('auth/login', 'features/better-auth/login/login.route.tsx'),
] satisfies RouteConfig;
