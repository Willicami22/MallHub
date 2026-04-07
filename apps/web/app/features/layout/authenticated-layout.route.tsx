import { Outlet } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import type { Route } from './+types/authenticated-layout.route';

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireAuthenticatedSession(request);

	return null;
};

export default function AuthenticatedLayoutRoute() {
	return <Outlet />;
}
