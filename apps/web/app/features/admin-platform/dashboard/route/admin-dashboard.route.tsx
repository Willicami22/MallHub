import {
	ActivityIcon,
	Building04Icon,
	Chart01Icon,
	DashboardSquare01Icon,
	ShieldKeyIcon,
	ShoppingBag01Icon,
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
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
	ADMIN_DASHBOARD_PERIOD_OPTIONS,
	type AdminDashboardPeriod,
} from '@/features/admin-platform/dashboard/admin-dashboard-period.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-dashboard.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_dashboard_meta_title() },
	{ name: 'description', content: m.admin_dashboard_meta_description() },
];

const getPeriodLabel = (period: AdminDashboardPeriod): string => {
	if (period === '7d') {
		return m.admin_dashboard_period_7d();
	}

	if (period === '90d') {
		return m.admin_dashboard_period_90d();
	}

	return m.admin_dashboard_period_30d();
};

const ACTIVITY_ACTION_LABELS = {
	'admin.user.created': () =>
		m.admin_dashboard_activity_action_admin_user_created(),
	'admin.user.role.updated': () =>
		m.admin_dashboard_activity_action_admin_user_role_updated(),
	'admin.user.banned': () =>
		m.admin_dashboard_activity_action_admin_user_banned(),
	'admin.user.unbanned': () =>
		m.admin_dashboard_activity_action_admin_user_unbanned(),
	'admin.cc.assignment.created': () =>
		m.admin_dashboard_activity_action_admin_cc_assignment_created(),
	'admin.mall.created': () =>
		m.admin_dashboard_activity_action_admin_mall_created(),
	'admin.mall.updated': () =>
		m.admin_dashboard_activity_action_admin_mall_updated(),
	'admin.mall.activated': () =>
		m.admin_dashboard_activity_action_admin_mall_activated(),
	'admin.mall.suspended': () =>
		m.admin_dashboard_activity_action_admin_mall_suspended(),
	'admin.mall.reactivated': () =>
		m.admin_dashboard_activity_action_admin_mall_reactivated(),
	'admin.platform.password-reset.completed': () =>
		m.admin_dashboard_activity_action_admin_platform_password_reset_completed(),
	'admin.platform.session.expired': () =>
		m.admin_dashboard_activity_action_admin_platform_session_expired(),
} as const;

const numberFormatter = new Intl.NumberFormat();

export default function AdminDashboardRoute() {
	const trpc = useTRPC();
	const [period, setPeriod] = useState<AdminDashboardPeriod>('30d');

	const metricsQuery = useQuery(
		trpc.adminDashboard.metrics.queryOptions({
			period,
		}),
	);

	const assignmentsQuery = useQuery(
		trpc.adminCcAssignments.list.queryOptions({
			limit: 8,
		}),
	);

	const activityQuery = useQuery(
		trpc.adminAudit.listRecent.queryOptions({
			limit: 8,
		}),
	);

	const periodItems = useMemo(
		() =>
			ADMIN_DASHBOARD_PERIOD_OPTIONS.map((item) => ({
				value: item,
				label: getPeriodLabel(item),
			})),
		[],
	);

	const headline = metricsQuery.data?.headline;
	const totals = metricsQuery.data?.totals;
	const completionRate =
		totals && totals.reservationsTotal > 0
			? Math.round(
					(totals.reservationsCompleted / totals.reservationsTotal) * 100,
				)
			: 0;

	const statCards = [
		{
			key: 'malls',
			label: () => m.admin_dashboard_malls_label(),
			value: headline?.activeMalls ?? 0,
			icon: Building04Icon,
		},
		{
			key: 'stores',
			label: () => m.admin_dashboard_stores_label(),
			value: headline?.activeStores ?? 0,
			icon: ShoppingBag01Icon,
		},
		{
			key: 'users',
			label: () => m.admin_dashboard_users_label(),
			value: headline?.activeCustomers ?? 0,
			icon: UserIcon,
		},
		{
			key: 'reservations',
			label: () => m.admin_dashboard_reservations_label(),
			value: headline?.reservationsTotal ?? 0,
			icon: Chart01Icon,
		},
	] as const;

	const isEmptyPlatform =
		!metricsQuery.isLoading &&
		(metricsQuery.data?.trend.length ?? 0) === 0 &&
		(assignmentsQuery.data?.assignments.length ?? 0) === 0;

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
					<Select
						items={periodItems}
						value={period}
						onValueChange={(value) =>
							setPeriod((value as AdminDashboardPeriod | null) ?? '30d')
						}
					>
						<SelectTrigger size="sm" className="w-[150px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ADMIN_DASHBOARD_PERIOD_OPTIONS.map((item) => (
								<SelectItem key={item} value={item}>
									{getPeriodLabel(item)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={<Link to={localizeHref('/admin/users')} />}
					>
						<HugeiconsIcon icon={UserGroupIcon} data-icon="inline-start" />
						{m.admin_users_title()}
					</Button>
					<Button
						size="sm"
						nativeButton={false}
						render={<Link to={localizeHref('/admin/users')} />}
					>
						<HugeiconsIcon icon={ShieldKeyIcon} data-icon="inline-start" />
						{m.admin_dashboard_create_admin_cc()}
					</Button>
				</div>
			</div>

			{isEmptyPlatform ? (
				<Card className="mb-6 border-dashed">
					<CardHeader>
						<CardTitle>{m.admin_dashboard_empty_title()}</CardTitle>
						<CardDescription>
							{m.admin_dashboard_empty_description()}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						<Button
							size="sm"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/users')} />}
						>
							{m.admin_dashboard_empty_cta_users()}
						</Button>
						<Button
							variant="outline"
							size="sm"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/malls')} />}
						>
							{m.admin_dashboard_empty_cta_malls()}
						</Button>
					</CardContent>
				</Card>
			) : null}

			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => (
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
								{metricsQuery.isLoading ? (
									<Skeleton className="h-7 w-20" />
								) : (
									<span className="text-2xl font-semibold tabular-nums">
										{numberFormatter.format(stat.value)}
									</span>
								)}
								<span className="text-xs text-muted-foreground">
									{m.admin_dashboard_period_window({
										period: getPeriodLabel(period),
									})}
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
									{m.admin_dashboard_admins_description()}
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								nativeButton={false}
								render={<Link to={localizeHref('/admin/users')} />}
							>
								<HugeiconsIcon icon={ShieldKeyIcon} data-icon="inline-start" />
								{m.admin_dashboard_create_admin_cc()}
							</Button>
						</div>
					</CardHeader>
					<Separator />
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{m.admin_dashboard_table_admin()}</TableHead>
								<TableHead>{m.admin_dashboard_table_mall()}</TableHead>
								<TableHead>{m.admin_dashboard_table_status()}</TableHead>
								<TableHead>{m.admin_dashboard_table_assigned_at()}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{assignmentsQuery.isLoading ? (
								<TableRow>
									<TableCell colSpan={4}>
										<Skeleton className="h-6 w-full" />
									</TableCell>
								</TableRow>
							) : assignmentsQuery.data?.assignments.length ? (
								assignmentsQuery.data.assignments.map((assignment) => {
									const isActive =
										assignment.mall.adminCcUserId ===
											assignment.adminCcUser.id &&
										!assignment.adminCcUser.banned;

									return (
										<TableRow key={assignment.id}>
											<TableCell>
												<div className="flex flex-col">
													<span className="text-sm font-medium">
														{assignment.adminCcUser.name}
													</span>
													<span className="text-xs text-muted-foreground">
														{assignment.adminCcUser.email}
													</span>
												</div>
											</TableCell>
											<TableCell>{assignment.mall.name}</TableCell>
											<TableCell>
												<Badge variant={isActive ? 'default' : 'secondary'}>
													{isActive
														? m.admin_dashboard_assignment_status_active()
														: m.admin_dashboard_assignment_status_inactive()}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{new Date(assignment.createdAt).toLocaleDateString()}
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-sm text-muted-foreground"
									>
										{m.admin_dashboard_assignments_empty()}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
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
							{activityQuery.isLoading ? (
								<Skeleton className="h-24 w-full" />
							) : activityQuery.data?.events.length ? (
								activityQuery.data.events.map((event) => (
									<div key={event.id} className="flex items-start gap-3">
										<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
											<HugeiconsIcon
												icon={ActivityIcon}
												className="size-3.5 text-muted-foreground"
											/>
										</div>
										<div className="flex min-w-0 flex-col gap-1">
											<span className="truncate text-sm text-foreground">
												{ACTIVITY_ACTION_LABELS[
													event.action as keyof typeof ACTIVITY_ACTION_LABELS
												]?.() ?? event.action}
											</span>
											<div className="flex items-center gap-2">
												<Badge
													variant={
														event.outcome === 'SUCCESS'
															? 'secondary'
															: 'destructive'
													}
												>
													{event.outcome === 'SUCCESS'
														? m.admin_dashboard_activity_outcome_success()
														: m.admin_dashboard_activity_outcome_failure()}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{new Date(event.createdAt).toLocaleString()}
												</span>
											</div>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground">
									{m.admin_dashboard_activity_empty()}
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="text-base">
						{m.admin_dashboard_platform_health()}
					</CardTitle>
					<CardDescription className="text-sm">
						{m.admin_dashboard_platform_totals_description({
							period: getPeriodLabel(period),
						})}
					</CardDescription>
				</CardHeader>
				<Separator />
				<CardContent className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>
								{m.admin_dashboard_health_searches()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<span className="text-2xl font-semibold tabular-nums">
								{numberFormatter.format(totals?.searchesCount ?? 0)}
							</span>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>
								{m.admin_dashboard_health_reservations_total()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<span className="text-2xl font-semibold tabular-nums">
								{numberFormatter.format(totals?.reservationsTotal ?? 0)}
							</span>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>
								{m.admin_dashboard_health_reservations_completed()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<span className="text-2xl font-semibold tabular-nums">
								{numberFormatter.format(totals?.reservationsCompleted ?? 0)}
							</span>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>
								{m.admin_dashboard_health_completion_rate()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<span className="text-2xl font-semibold tabular-nums">
								{completionRate}%
							</span>
						</CardContent>
					</Card>
				</CardContent>
				{metricsQuery.data?.mallBreakdown.length ? (
					<>
						<Separator />
						<CardContent className="pt-4">
							<div className="mb-3 text-sm font-medium text-foreground">
								{m.admin_dashboard_mall_breakdown_title()}
							</div>
							<div className="space-y-2">
								{metricsQuery.data.mallBreakdown.slice(0, 5).map((mall) => (
									<div
										key={mall.mallId}
										className="flex items-center justify-between"
									>
										<div className="flex flex-col">
											<span className="text-sm font-medium">
												{mall.mallName}
											</span>
											<span className="text-xs text-muted-foreground">
												{m.admin_dashboard_health_reservations_total()}:{' '}
												{numberFormatter.format(mall.reservationsTotal)}
											</span>
										</div>
										<Badge variant="secondary">
											{numberFormatter.format(mall.searchesCount)}{' '}
											{m.admin_dashboard_health_searches().toLowerCase()}
										</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</>
				) : (
					<>
						<Separator />
						<CardContent className="py-6">
							<p className="text-sm text-muted-foreground">
								{m.admin_dashboard_health_mall_breakdown_empty()}
							</p>
						</CardContent>
					</>
				)}
			</Card>
		</div>
	);
}
