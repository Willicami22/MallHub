import {
	ActivityIcon,
	Add01Icon,
	Building04Icon,
	Chart01Icon,
	DashboardSquare01Icon,
	ShoppingBag01Icon,
	UserAdd01Icon,
	UserGroupIcon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Separator,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import { Link } from 'react-router';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-dashboard.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_dashboard_meta_title() },
	{ name: 'description', content: m.admin_dashboard_meta_description() },
];

// TODO-MOCK: Replace with real data
const STAT_CARDS = [
	{
		key: 'malls',
		label: () => m.admin_dashboard_malls_label(),
		value: '—',
		icon: Building04Icon,
		trend: '+2 este mes',
	},
	{
		key: 'stores',
		label: () => m.admin_dashboard_stores_label(),
		value: '—',
		icon: ShoppingBag01Icon,
		trend: '+14 esta semana',
	},
	{
		key: 'users',
		label: () => m.admin_dashboard_users_label(),
		value: '—',
		icon: UserIcon,
		trend: '+230 este mes',
	},
	{
		key: 'reservations',
		label: () => m.admin_dashboard_reservations_label(),
		value: '—',
		icon: Chart01Icon,
		trend: '+1.2k esta semana',
	},
] as const;

// TODO-MOCK: Replace with real data
const PLACEHOLDER_ADMIN_CCS = [
	{ id: 'acc1', status: 'active' as const },
	{ id: 'acc2', status: 'active' as const },
	{ id: 'acc3', status: 'inactive' as const },
] as const;

// TODO-MOCK: Replace with real data
const PLACEHOLDER_ACTIVITY = [
	{ id: 'a1', type: 'store_registered' },
	{ id: 'a2', type: 'admin_cc_created' },
	{ id: 'a3', type: 'store_approved' },
	{ id: 'a4', type: 'store_registered' },
	{ id: 'a5', type: 'admin_cc_created' },
] as const;

export default function AdminDashboardRoute() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={DashboardSquare01Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_dashboard_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_dashboard_subtitle()}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={<Link to={localizeHref('/admin/users')} />}
					>
						<HugeiconsIcon icon={UserGroupIcon} data-icon="inline-start" />
						{m.admin_users_title()}
					</Button>
					<Button size="sm">
						<HugeiconsIcon icon={UserAdd01Icon} data-icon="inline-start" />
						{m.admin_dashboard_create_admin_cc()}
					</Button>
				</div>
			</div>

			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{STAT_CARDS.map((stat) => (
					<Card key={stat.key}>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardDescription className="text-xs font-medium uppercase tracking-wide">
									{stat.label()}
								</CardDescription>
								<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
									<HugeiconsIcon
										icon={stat.icon}
										className="size-4 text-primary"
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pb-3">
							<div className="flex flex-col gap-1">
								<Skeleton className="h-7 w-20" />
								<span className="text-xs text-muted-foreground">
									{stat.trend}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex flex-col gap-0.5">
								<CardTitle className="text-base">
									{m.admin_dashboard_admins_section()}
								</CardTitle>
								<CardDescription className="text-sm">
									Administradores de centros comerciales en la plataforma
								</CardDescription>
							</div>
							<Button variant="outline" size="sm">
								<HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
								{m.admin_dashboard_create_admin_cc()}
							</Button>
						</div>
					</CardHeader>
					<Separator />
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Administrador</TableHead>
								<TableHead>Centro Comercial</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="w-10" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{PLACEHOLDER_ADMIN_CCS.map((acc) => (
								<TableRow key={acc.id}>
									<TableCell>
										<div className="flex items-center gap-2.5">
											<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
												<HugeiconsIcon
													icon={UserIcon}
													className="size-3.5 text-muted-foreground"
												/>
											</div>
											<Skeleton className="h-3.5 w-28" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-3.5 w-32" />
									</TableCell>
									<TableCell>
										<Badge
											variant={
												acc.status === 'active' ? 'default' : 'secondary'
											}
										>
											{acc.status === 'active' ? 'Activo' : 'Inactivo'}
										</Badge>
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="icon-xs">
											<HugeiconsIcon
												icon={UserAdd01Icon}
												className="size-3.5"
											/>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<CardFooter className="justify-center pt-3 pb-4">
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/users')} />}
						>
							{m.admin_users_title()}
						</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={ActivityIcon}
								className="size-4 text-muted-foreground"
							/>
							<CardTitle className="text-base">
								{m.admin_dashboard_recent_activity()}
							</CardTitle>
						</div>
					</CardHeader>
					<Separator />
					<CardContent className="pt-4">
						<div className="flex flex-col gap-3">
							{PLACEHOLDER_ACTIVITY.map((activity) => (
								<div key={activity.id} className="flex items-start gap-3">
									<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
										<HugeiconsIcon
											icon={
												activity.type === 'admin_cc_created'
													? UserAdd01Icon
													: activity.type === 'store_approved'
														? Building04Icon
														: ShoppingBag01Icon
											}
											className="size-3.5 text-muted-foreground"
										/>
									</div>
									<div className="flex flex-col gap-1 overflow-hidden">
										<Skeleton className="h-3.5 w-36" />
										<Skeleton className="h-3 w-20" />
									</div>
								</div>
							))}
						</div>
					</CardContent>
					<CardFooter className="justify-center pb-4">
						<Button variant="ghost" size="sm" className="text-muted-foreground">
							Ver toda la actividad
						</Button>
					</CardFooter>
				</Card>
			</div>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="text-base">
						{m.admin_dashboard_platform_health()}
					</CardTitle>
					<CardDescription className="text-sm">
						Métricas de salud del sistema — próximamente
					</CardDescription>
				</CardHeader>
				<Separator />
				<CardContent className="py-8">
					<div className="flex flex-col items-center gap-3 text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted">
							<HugeiconsIcon
								icon={Chart01Icon}
								className="size-6 text-muted-foreground"
							/>
						</div>
						<p className="text-sm text-muted-foreground">
							Las métricas detalladas de la plataforma estarán disponibles en
							próximas versiones.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
