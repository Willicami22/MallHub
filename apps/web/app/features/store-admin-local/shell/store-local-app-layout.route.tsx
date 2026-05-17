import {
	Calendar03Icon,
	DashboardSquare01Icon,
	Settings02Icon,
	ShoppingBag01Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button, cn } from '@mallhub/ui';
import { Link, Outlet, redirect, useLocation } from 'react-router';
import { requireRoleSession } from '@/features/.server/auth/auth-route-guard.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/store-local-app-layout.route';

export const loader = async ({ request }: Route.LoaderArgs) => {
	const session = await requireRoleSession(request, [appRoles.ADMIN_LOCAL]);

	const store = await prisma.store.findFirst({
		where: { ownerUserId: session.user.id, status: { not: 'SUSPENDED' } },
		select: { id: true, name: true, status: true },
	});

	if (!store) {
		throw redirect(localizeHref('/store-local/pending'));
	}

	return { store };
};

const NAV_LINKS = [
	{
		href: '/store-local/dashboard',
		label: 'Dashboard',
		icon: DashboardSquare01Icon,
	},
	{
		href: '/store-local/products',
		label: 'Catálogo',
		icon: ShoppingBag01Icon,
	},
	{
		href: '/store-local/reservations',
		label: 'Reservas',
		icon: Calendar03Icon,
	},
	{
		href: '/store-local/promotions',
		label: 'Promociones',
		icon: Tag01Icon,
	},
	{
		href: '/store-local/config',
		label: 'Configuración',
		icon: Settings02Icon,
	},
] as const;

export default function StoreLocalAppLayoutRoute({
	loaderData,
}: Route.ComponentProps) {
	const location = useLocation();

	return (
		<>
			<section className="border-b bg-muted/20">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
					<div className="mb-3">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							{loaderData.store.name}
						</h2>
						<p className="text-sm text-muted-foreground">
							Panel de administración
						</p>
					</div>
					<nav className="flex flex-wrap gap-1.5">
						{NAV_LINKS.map((item) => {
							const localizedHref = localizeHref(item.href);
							const isActive =
								location.pathname === localizedHref ||
								location.pathname.startsWith(`${localizedHref}/`);

							return (
								<Button
									key={item.href}
									variant={isActive ? 'secondary' : 'ghost'}
									size="sm"
									className={cn('justify-start')}
									nativeButton={false}
									render={<Link to={localizedHref} />}
								>
									<HugeiconsIcon icon={item.icon} data-icon="inline-start" />
									{item.label}
								</Button>
							);
						})}
					</nav>
				</div>
			</section>
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
				<Outlet context={{ storeId: loaderData.store.id }} />
			</div>
		</>
	);
}
