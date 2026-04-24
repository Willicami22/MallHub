import { Outlet } from 'react-router';
import { requireRoleSession } from '@/features/.server/auth/auth-route-guard.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { AdminIdleSessionExpiryGuard } from '@/features/layout/components/admin-idle-session-expiry-guard';
import type { Route } from './+types/admin-platform-layout.route';

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireRoleSession(request, [appRoles.ADMIN_PLATFORM]);

	return null;
};

export default function AdminPlatformLayoutRoute() {
	return (
		<>
			<AdminIdleSessionExpiryGuard />
			<Outlet />
		</>
	);
}
