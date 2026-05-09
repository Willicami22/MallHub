import {
	Building04Icon,
	Calendar03Icon,
	DashboardSquare01Icon,
	Logout01Icon,
	Settings02Icon,
	ShoppingBag01Icon,
	Tag01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button, Separator } from '@mallhub/ui';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink, useNavigate } from 'react-router';
import { signOut } from '@/features/better-auth/better-auth-client.lib';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { localizeHref } from '@/paraglide/runtime.js';

const nav = [
	{
		to: '/store-local/dashboard',
		label: 'Dashboard',
		icon: DashboardSquare01Icon,
	},
	{ to: '/store-local/products', label: 'Catálogo', icon: ShoppingBag01Icon },
	{ to: '/store-local/reservations', label: 'Reservas', icon: Calendar03Icon },
	{ to: '/store-local/promotions', label: 'Promociones', icon: Tag01Icon },
	{
		to: '/store-local/config',
		label: 'Configuración de Tienda',
		icon: Settings02Icon,
	},
] as const;

export function StoreLocalSidebar({ storeName }: { storeName: string }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const session = useAppSession();
	const email = session.data?.user.email ?? '—';

	const handleSignOut = async () => {
		await signOut();
		queryClient.clear();
		navigate(localizeHref('/'));
	};

	return (
		<aside className="flex w-64 shrink-0 flex-col border-r bg-card">
			<div className="flex items-center gap-2 px-4 py-5">
				<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
					<HugeiconsIcon
						icon={Building04Icon}
						className="size-5 text-primary"
					/>
				</div>
				<div className="flex min-w-0 flex-col">
					<span className="truncate text-sm font-semibold">{storeName}</span>
					<span className="truncate text-xs text-muted-foreground">
						Panel local
					</span>
				</div>
			</div>
			<Separator />
			<nav className="flex flex-1 flex-col gap-0.5 p-2">
				{nav.map((item) => (
					<NavLink
						key={item.to}
						to={localizeHref(item.to)}
						className={({ isActive }) =>
							[
								'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								isActive
									? 'bg-primary/10 text-primary'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground',
							].join(' ')
						}
					>
						<HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
						{item.label}
					</NavLink>
				))}
			</nav>
			<Separator />
			<div className="space-y-2 p-3">
				<div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2 py-2">
					<HugeiconsIcon
						icon={UserIcon}
						className="size-4 text-muted-foreground"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate text-xs font-medium">{email}</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() => {
						void handleSignOut();
					}}
				>
					<HugeiconsIcon icon={Logout01Icon} className="size-4" />
					Cerrar sesión
				</Button>
			</div>
		</aside>
	);
}
