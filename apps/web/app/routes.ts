import {
	index,
	prefix,
	type RouteConfig,
	route,
} from '@react-router/dev/routes';
import './features/.server/env/server-env.lib';

export default [
	route('api/trpc/*', 'features/trpc/trpc.handler.ts'),
	route('api/auth/*', 'features/better-auth/better-auth.handler.ts'),
	...prefix(':locale?', [
		index('features/home/route/home.route.tsx'),
		route('auth/login', 'features/better-auth/login/login.route.tsx'),
		route('auth/register', 'features/better-auth/register/register.route.tsx'),
	]),
] satisfies RouteConfig;
