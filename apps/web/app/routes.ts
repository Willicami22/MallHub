import {
	index,
	layout,
	prefix,
	type RouteConfig,
	route,
} from '@react-router/dev/routes';
import './features/.server/env/server-env.lib';

export default [
	route('api/trpc/*', 'features/trpc/trpc.handler.ts'),
	route('api/auth/*', 'features/better-auth/better-auth.handler.ts'),
	...prefix(':locale?', [
		route('auth/login', 'features/better-auth/login/login.route.tsx'),
		route('auth/register', 'features/better-auth/register/register.route.tsx'),
		layout('features/layout/main-layout.route.tsx', [
			index('features/home/route/home.route.tsx'),
			route('malls', 'features/malls/route/malls.route.tsx'),
			route('stores', 'features/stores/route/stores.route.tsx'),
			route('search', 'features/search/route/search.route.tsx'),
			...prefix('store-local', [
				layout(
					'features/store-admin-local/shell/store-local-public-layout.route.tsx',
					[
						route(
							'login',
							'features/store-admin-local/auth/route/store-local-login.route.tsx',
						),
						route(
							'register',
							'features/store-admin-local/auth/route/store-local-register.route.tsx',
						),
						route(
							'forgot-password',
							'features/store-admin-local/auth/route/store-local-forgot-password.route.tsx',
						),
					],
				),
				layout(
					'features/store-admin-local/shell/store-local-app-layout.route.tsx',
					[
						route(
							'dashboard',
							'features/store-admin-local/store-dashboard/route/store-dashboard.route.tsx',
						),
						route(
							'products',
							'features/store-admin-local/products/route/store-products.route.tsx',
						),
						route(
							'reservations',
							'features/store-admin-local/reservations/route/store-reservations.route.tsx',
						),
						route(
							'profile',
							'features/store-admin-local/store-profile/route/store-profile.route.tsx',
						),
					],
				),
			]),
			layout('features/layout/authenticated-layout.route.tsx', [
				route(
					'dashboard',
					'features/customer/dashboard/route/customer-dashboard.route.tsx',
				),
			]),
			...prefix('admin', [
				layout('features/layout/admin-platform-layout.route.tsx', [
					route(
						'dashboard',
						'features/admin-platform/dashboard/route/admin-dashboard.route.tsx',
					),
					route(
						'users',
						'features/admin-platform/users/route/admin-users.route.tsx',
					),
				]),
			]),
		]),
	]),
] satisfies RouteConfig;
