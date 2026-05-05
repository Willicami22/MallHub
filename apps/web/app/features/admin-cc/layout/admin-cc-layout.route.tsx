import {
	AiBrain01Icon,
	DashboardSquare01Icon,
	Settings01Icon,
	ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button, cn } from '@mallhub/ui';
import { Link, Outlet, useLocation } from 'react-router';
import { requireRoleSession } from '@/features/.server/auth/auth-route-guard.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-cc-layout.route';

const ADMIN_CC_WORKSPACE_LINKS = [
	{
		href: '/admin-cc/dashboard',
		label: () => m.admin_cc_nav_dashboard(),
		icon: DashboardSquare01Icon,
	},
	{
		href: '/admin-cc/stores',
		label: () => m.admin_cc_nav_stores(),
		icon: ShoppingBag01Icon,
	},
	{
		href: '/admin-cc/ai-reports',
		label: () => m.admin_cc_nav_ai_reports(),
		icon: AiBrain01Icon,
	},
	{
		href: '/admin-cc/config',
		label: () => m.admin_cc_nav_config(),
		icon: Settings01Icon,
	},
] as const;

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
	const location = useLocation();

	return (
		<>
			<section className="border-b bg-muted/20">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
					<div className="mb-3">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							{m.admin_cc_workspace_title()}
						</h2>
						<p className="text-sm text-muted-foreground">
							{m.admin_cc_workspace_subtitle()}
						</p>
					</div>
					<nav className="flex flex-wrap gap-1.5">
						{ADMIN_CC_WORKSPACE_LINKS.map((item) => {
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
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
				<Outlet />
			</div>
		</>
	);
}
