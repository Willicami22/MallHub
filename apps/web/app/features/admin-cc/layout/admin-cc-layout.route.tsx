import { Outlet } from 'react-router';
import { requireRoleSession } from '@/features/.server/auth/auth-route-guard.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import type { Route } from './+types/admin-cc-layout.route';

export const loader = async (ctx: Route.LoaderArgs) => {
	const requestUrl = new URL(ctx.request.url);
	const isLocalDevRequest =
		requestUrl.hostname === 'localhost' ||
		requestUrl.hostname === '127.0.0.1' ||
		requestUrl.hostname === '[::1]';
	const isDevelopment =
		process.env.NODE_ENV === 'development' ||
		import.meta.env.DEV ||
		isLocalDevRequest;

	// Dev-only bypass with immediate return (no auth guard, no redirects)
	if (isDevelopment) {
		return {
			user: {
				id: 'dev-admin',
				email: 'admin@mallhub.com',
				role: appRoles.ADMIN_CC,
			},
		};
	}

	return await requireRoleSession(ctx.request, [appRoles.ADMIN_CC]);
};

export default function AdminCcLayoutRoute() {
	return (
		<div className="admin-cc-layout min-h-screen bg-muted/40">
			{/* Aquí montaremos el Sidebar y Header posteriormente */}
			<div className="flex flex-col">
				<main className="flex-1 p-4 md:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
