import { layout, prefix, route } from '@react-router/dev/routes';

// Archivo que define las rutas para Admin CC
export const adminCcRoutes = [
	...prefix('admin-cc', [
		layout('features/admin-cc/layout/admin-cc-layout.route.tsx', [
			route(
				'dashboard',
				'features/admin-cc/dashboard/route/admin-cc-dashboard.route.tsx',
			),
			route(
				'stores',
				'features/admin-cc/stores/route/admin-cc-stores.route.tsx',
			),
			route(
				'events',
				'features/admin-cc/events/route/admin-cc-events.route.tsx',
			),
			route(
				'config',
				'features/admin-cc/config/route/admin-cc-config.route.tsx',
			),
			route(
				'ai-reports',
				'features/admin-cc/ai-reports/route/admin-cc-reports.route.tsx',
			),
		]),
	]),
];
