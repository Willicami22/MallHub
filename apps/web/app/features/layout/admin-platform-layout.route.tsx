import {
	ActivityIcon,
	Analytics01Icon,
	Building04Icon,
	Chart01Icon,
	DashboardSquare01Icon,
	Invoice03Icon,
	ShieldKeyIcon,
	ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button, cn } from '@mallhub/ui';
import { Link, Outlet, useLocation } from 'react-router';
import { requireRoleSession } from '@/features/.server/auth/auth-route-guard.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { AdminIdleSessionExpiryGuard } from '@/features/layout/components/admin-idle-session-expiry-guard';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-platform-layout.route';

const ADMIN_WORKSPACE_LINKS = [
	{
		href: '/admin/dashboard',
		label: () => m.admin_nav_dashboard(),
		icon: DashboardSquare01Icon,
	},
	{
		href: '/admin/users',
		label: () => m.admin_nav_users(),
		icon: ShieldKeyIcon,
	},
	{
		href: '/admin/malls',
		label: () => m.admin_nav_malls(),
		icon: Building04Icon,
	},
	{
		href: '/admin/stores',
		label: () => m.admin_nav_stores(),
		icon: ShoppingBag01Icon,
	},
	{
		href: '/admin/moderation',
		label: () => m.admin_nav_moderation(),
		icon: ActivityIcon,
	},
	{
		href: '/admin/audit',
		label: () => m.admin_nav_audit(),
		icon: ActivityIcon,
	},
	{
		href: '/admin/health',
		label: () => m.admin_nav_health(),
		icon: Analytics01Icon,
	},
	{
		href: '/admin/billing',
		label: () => m.admin_nav_billing(),
		icon: Invoice03Icon,
	},
	{
		href: '/admin/campaigns',
		label: () => m.admin_nav_campaigns(),
		icon: Chart01Icon,
	},
] as const;

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireRoleSession(request, [appRoles.ADMIN_PLATFORM]);

	return null;
};

export default function AdminPlatformLayoutRoute() {
	const location = useLocation();

	return (
		<>
			<AdminIdleSessionExpiryGuard />
			<section className="border-b bg-muted/20">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
					<div className="mb-3">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							{m.admin_workspace_title()}
						</h2>
						<p className="text-sm text-muted-foreground">
							{m.admin_workspace_subtitle()}
						</p>
					</div>
					<nav className="flex flex-wrap gap-1.5">
						{ADMIN_WORKSPACE_LINKS.map((item) => {
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
									{item.label()}
								</Button>
							);
						})}
					</nav>
				</div>
			</section>
			<Outlet />
		</>
	);
}
