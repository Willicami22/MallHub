import {
	index,
	layout,
	prefix,
	type RouteConfig,
	route,
} from '@react-router/dev/routes';

export default [
	route('api/trpc/*', 'features/trpc/trpc.handler.ts'),
	route('api/auth/*', 'features/better-auth/better-auth.handler.ts'),
	...prefix(':locale?', [
		route(
			'auth/reset-password',
			'features/better-auth/reset-password-request/reset-password-request.route.tsx',
		),
		route(
			'auth/reset-password/confirm',
			'features/better-auth/reset-password-confirm/reset-password-confirm.route.tsx',
		),
		route('auth/login', 'features/better-auth/login/login.route.tsx'),
		route('auth/register', 'features/better-auth/register/register.route.tsx'),
		layout('features/layout/main-layout.route.tsx', [
			index('features/home/route/home.route.tsx'),
			route('malls', 'features/malls/route/malls.route.tsx'),
			route('stores', 'features/stores/route/stores.route.tsx'),
			route('search', 'features/search/route/search.route.tsx'),
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
					route(
						'malls',
						'features/admin-platform/malls/route/admin-malls.route.tsx',
					),
					route(
						'malls/:mallId',
						'features/admin-platform/malls/route/admin-mall-detail.route.tsx',
					),
					route(
						'stores',
						'features/admin-platform/stores/route/admin-stores.route.tsx',
					),
					route(
						'stores/:storeId',
						'features/admin-platform/stores/route/admin-store-detail.route.tsx',
					),
					route(
						'moderation',
						'features/admin-platform/moderation/route/admin-moderation.route.tsx',
					),
					route(
						'moderation/:reportId',
						'features/admin-platform/moderation/route/admin-moderation-detail.route.tsx',
					),
					route(
						'audit',
						'features/admin-platform/audit/route/admin-audit.route.tsx',
					),
					route(
						'health',
						'features/admin-platform/health/route/admin-health.route.tsx',
					),
					route(
						'billing',
						'features/admin-platform/billing/route/admin-billing.route.tsx',
					),
					route(
						'billing/:subscriptionId',
						'features/admin-platform/billing/route/admin-billing-detail.route.tsx',
					),
					route(
						'campaigns',
						'features/admin-platform/campaigns/route/admin-campaigns.route.tsx',
					),
				]),
			]),
		]),
	]),
] satisfies RouteConfig;
