import { Outlet } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import { StoreLocalSidebar } from '@/features/store-admin-local/shell/store-local-sidebar';
import type { Route } from './+types/store-local-app-layout.route';

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireAuthenticatedSession(request);
	return null;
};

export default function StoreLocalAppLayoutRoute() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
			<StoreLocalSidebar />
			<main className="flex-1 overflow-x-auto px-4 py-8 sm:px-8">
				<div className="mx-auto max-w-6xl">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
