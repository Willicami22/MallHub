import { Outlet, redirect } from 'react-router';
import { requireRoleSession } from '@/features/.server/auth/auth-route-guard.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { StoreLocalSidebar } from '@/features/store-admin-local/shell/store-local-sidebar';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/store-local-app-layout.route';

export const loader = async ({ request }: Route.LoaderArgs) => {
	const session = await requireRoleSession(request, [appRoles.ADMIN_LOCAL]);

	const activeStore = await prisma.store.findFirst({
		where: { ownerUserId: session.user.id, status: 'ACTIVE' },
		select: { id: true, name: true },
	});

	if (!activeStore) {
		throw redirect(localizeHref('/store-local/pending'));
	}

	return { store: activeStore };
};

export default function StoreLocalAppLayoutRoute({
	loaderData,
}: Route.ComponentProps) {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
			<StoreLocalSidebar storeName={loaderData.store.name} />
			<main className="flex-1 overflow-x-auto px-4 py-8 sm:px-8">
				<div className="mx-auto max-w-6xl">
					<Outlet context={{ storeId: loaderData.store.id }} />
				</div>
			</main>
		</div>
	);
}
