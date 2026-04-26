import {
	Analytics01Icon,
	FilterIcon,
	Search01Icon,
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
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { PlatformHealthIncidentStatusBadge } from '@/features/admin-platform/health/components/platform-health-incident-status-badge';
import {
	getPlatformHealthAlertSeverityLabel,
	getPlatformHealthSummaryMessage,
	getPlatformServiceLabel,
	type PlatformServiceKey,
} from '@/features/admin-platform/health/components/platform-health-labels.lib';
import { PlatformServiceStatusBadge } from '@/features/admin-platform/health/components/platform-service-status-badge';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/admin-health.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_health_meta_title() },
	{ name: 'description', content: m.admin_health_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const INCIDENT_SORT_OPTIONS = [
	{
		value: 'desc',
		label: () => m.admin_health_incidents_sort_newest(),
	},
	{
		value: 'asc',
		label: () => m.admin_health_incidents_sort_oldest(),
	},
] as const;

const INCIDENT_STATUS_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_health_incidents_filter_status_all(),
	},
	{
		value: 'OPEN',
		label: () => m.admin_health_incident_status_open(),
	},
	{
		value: 'RESOLVED',
		label: () => m.admin_health_incident_status_resolved(),
	},
] as const;

export default function AdminHealthRoute() {
	const trpc = useTRPC();

	const [incidentPage, setIncidentPage] = useState(1);
	const [incidentPageSize, setIncidentPageSize] = useState<number>(10);
	const [incidentSearch, setIncidentSearch] = useState('');
	const [debouncedIncidentSearch, setDebouncedIncidentSearch] = useState('');
	const [incidentStatusFilter, setIncidentStatusFilter] = useState('ALL');
	const [serviceFilter, setServiceFilter] = useState('ALL');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [incidentSortDirection, setIncidentSortDirection] = useState<
		'asc' | 'desc'
	>('desc');
	const [searchTimer, setSearchTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

	const handleIncidentSearchChange = (value: string) => {
		setIncidentSearch(value);
		if (searchTimer) {
			clearTimeout(searchTimer);
		}

		const timer = setTimeout(() => {
			setDebouncedIncidentSearch(value);
			setIncidentPage(1);
		}, 400);

		setSearchTimer(timer);
	};

	const statusQuery = useQuery(trpc.adminHealth.status.queryOptions());
	const incidentsQuery = useQuery(
		trpc.adminHealth.listIncidents.queryOptions({
			page: incidentPage,
			pageSize: incidentPageSize,
			search: debouncedIncidentSearch || undefined,
			statusFilter:
				incidentStatusFilter === 'ALL'
					? undefined
					: (incidentStatusFilter as 'OPEN' | 'RESOLVED'),
			serviceFilter:
				serviceFilter === 'ALL'
					? undefined
					: (serviceFilter as PlatformServiceKey),
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
			sortDirection: incidentSortDirection,
		}),
	);

	const serviceFilterItems = useMemo(
		() => [
			{
				value: 'ALL',
				label: m.admin_health_incidents_filter_service_all(),
			},
			...(statusQuery.data?.services ?? []).map((service) => ({
				value: service.serviceKey,
				label: getPlatformServiceLabel(
					service.serviceKey as PlatformServiceKey,
				),
			})),
		],
		[statusQuery.data?.services],
	);

	const statusFilterItems = useMemo(
		() =>
			INCIDENT_STATUS_FILTER_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);

	const sortItems = useMemo(
		() =>
			INCIDENT_SORT_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);

	const pageSizeItems = useMemo(
		() =>
			PAGE_SIZES.map((size) => ({
				value: size.toString(),
				label: `${size} ${m.admin_health_incidents_rows_per_page()}`,
			})),
		[],
	);

	const services = statusQuery.data?.services ?? [];
	const alerts = statusQuery.data?.alerts ?? [];
	const summary = statusQuery.data?.summary;
	const incidents = incidentsQuery.data?.incidents ?? [];
	const incidentsTotal = incidentsQuery.data?.total ?? 0;
	const incidentsTotalPages = incidentsQuery.data?.totalPages ?? 1;
	const incidentsFrom =
		incidentsTotal > 0 ? (incidentPage - 1) * incidentPageSize + 1 : 0;
	const incidentsTo = Math.min(incidentPage * incidentPageSize, incidentsTotal);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={Analytics01Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_health_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_health_subtitle()}
						</p>
					</div>
				</div>
				{summary ? (
					<p className="text-xs text-muted-foreground">
						{m.admin_health_last_checked({
							date: new Date(summary.lastCheckedAt).toLocaleString(),
						})}
					</p>
				) : null}
			</div>

			<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							{m.admin_health_summary_operational()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<span className="text-2xl font-semibold tabular-nums">
							{summary?.operationalServices ?? 0}
						</span>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							{m.admin_health_summary_degraded()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<span className="text-2xl font-semibold tabular-nums">
							{summary?.degradedServices ?? 0}
						</span>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							{m.admin_health_summary_incident()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<span className="text-2xl font-semibold tabular-nums">
							{summary?.incidentServices ?? 0}
						</span>
					</CardContent>
				</Card>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-base">
						{m.admin_health_services_title()}
					</CardTitle>
					<CardDescription>
						{m.admin_health_services_subtitle()}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{statusQuery.isLoading
						? Array.from({ length: 4 }).map((_, index) => (
								<div
									key={`health-service-skeleton-${index.toString()}`}
									className="h-28 rounded-lg border bg-muted/40"
								/>
							))
						: services.map((service) => (
								<div
									key={service.serviceKey}
									className="rounded-lg border bg-card p-4"
								>
									<div className="mb-2 flex items-center justify-between gap-2">
										<p className="text-sm font-medium">
											{getPlatformServiceLabel(
												service.serviceKey as PlatformServiceKey,
											)}
										</p>
										<PlatformServiceStatusBadge status={service.status} />
									</div>
									<p className="text-xs text-muted-foreground">
										{getPlatformHealthSummaryMessage(
											service.summaryCode,
											service.summaryParams as
												| Record<string, unknown>
												| undefined,
										)}
									</p>
								</div>
							))}
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-base">
						{m.admin_health_alerts_title()}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{alerts.length > 0 ? (
						<div className="space-y-2">
							{alerts.map((alert) => (
								<div
									key={alert.id}
									className="flex items-start justify-between gap-3 rounded-md border p-3"
								>
									<div className="min-w-0">
										<p className="text-sm">
											{getPlatformHealthSummaryMessage(
												alert.code,
												alert.params as Record<string, unknown> | undefined,
											)}
										</p>
										{alert.relatedServiceKey ? (
											<p className="text-xs text-muted-foreground">
												{getPlatformServiceLabel(alert.relatedServiceKey)}
											</p>
										) : null}
									</div>
									<Badge
										variant={
											alert.severity === 'CRITICAL'
												? 'destructive'
												: alert.severity === 'WARNING'
													? 'secondary'
													: 'outline'
										}
									>
										{getPlatformHealthAlertSeverityLabel(alert.severity)}
									</Badge>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							{m.admin_health_alerts_empty()}
						</p>
					)}
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-base">
						{m.admin_health_incidents_title()}
					</CardTitle>
					<CardDescription>
						{m.admin_health_incidents_subtitle()}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								value={incidentSearch}
								onChange={(event) =>
									handleIncidentSearchChange(event.target.value)
								}
								placeholder={m.admin_health_incidents_search_placeholder()}
								className="pl-9"
							/>
						</div>
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={FilterIcon}
								className="size-4 text-muted-foreground"
							/>
							<Select
								items={statusFilterItems}
								value={incidentStatusFilter}
								onValueChange={(value) => {
									setIncidentStatusFilter(value ?? 'ALL');
									setIncidentPage(1);
								}}
							>
								<SelectTrigger className="w-[190px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{INCIDENT_STATUS_FILTER_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								items={serviceFilterItems}
								value={serviceFilter}
								onValueChange={(value) => {
									setServiceFilter(value ?? 'ALL');
									setIncidentPage(1);
								}}
							>
								<SelectTrigger className="w-[220px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{serviceFilterItems.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								items={sortItems}
								value={incidentSortDirection}
								onValueChange={(value) => {
									if (value === null) {
										return;
									}

									setIncidentSortDirection(value as 'asc' | 'desc');
									setIncidentPage(1);
								}}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{INCIDENT_SORT_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="flex flex-col gap-1">
							<span className="text-xs text-muted-foreground">
								{m.admin_health_incidents_filter_date_from()}
							</span>
							<Input
								type="date"
								value={dateFrom}
								onChange={(event) => {
									setDateFrom(event.target.value);
									setIncidentPage(1);
								}}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-xs text-muted-foreground">
								{m.admin_health_incidents_filter_date_to()}
							</span>
							<Input
								type="date"
								value={dateTo}
								onChange={(event) => {
									setDateTo(event.target.value);
									setIncidentPage(1);
								}}
							/>
						</div>
					</div>
					{incidentsTotal > 0 ? (
						<div className="flex justify-end">
							<Badge variant="secondary">
								{m.admin_health_incidents_total_count({
									count: incidentsTotal,
								})}
							</Badge>
						</div>
					) : null}
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.admin_health_incidents_column_service()}</TableHead>
							<TableHead>{m.admin_health_incidents_column_status()}</TableHead>
							<TableHead>{m.admin_health_incidents_column_title()}</TableHead>
							<TableHead>
								{m.admin_health_incidents_column_started_at()}
							</TableHead>
							<TableHead>
								{m.admin_health_incidents_column_resolved_at()}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{incidentsQuery.isLoading ? (
							Array.from({ length: incidentPageSize }).map((_, index) => (
								<TableRow key={`health-incident-skeleton-${index.toString()}`}>
									<TableCell colSpan={5}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : incidents.length > 0 ? (
							incidents.map((incident) => (
								<TableRow key={incident.id}>
									<TableCell>
										{getPlatformServiceLabel(
											incident.serviceKey as PlatformServiceKey,
										)}
									</TableCell>
									<TableCell>
										<PlatformHealthIncidentStatusBadge
											status={incident.status}
										/>
									</TableCell>
									<TableCell className="max-w-[420px]">
										{getPlatformHealthSummaryMessage(
											incident.summaryCode,
											incident.summaryParamsJson as
												| Record<string, unknown>
												| undefined,
										)}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(incident.startedAt).toLocaleString()}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{incident.resolvedAt
											? new Date(incident.resolvedAt).toLocaleString()
											: m.admin_health_incidents_not_resolved()}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-24 text-center text-muted-foreground"
								>
									{m.admin_health_incidents_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{incidentsTotal > 0
						? m.admin_health_incidents_pagination_info({
								from: incidentsFrom.toString(),
								to: incidentsTo.toString(),
								total: incidentsTotal.toString(),
							})
						: null}
				</p>
				<div className="flex items-center gap-2">
					<Select
						items={pageSizeItems}
						value={incidentPageSize.toString()}
						onValueChange={(value) => {
							if (value === null) {
								return;
							}

							setIncidentPageSize(Number(value));
							setIncidentPage(1);
						}}
					>
						<SelectTrigger size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZES.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size} {m.admin_health_incidents_rows_per_page()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setIncidentPage((currentPage) => Math.max(1, currentPage - 1))
						}
						disabled={incidentPage <= 1 || incidentsQuery.isFetching}
					>
						{m.admin_health_incidents_pagination_previous()}
					</Button>
					<span className="text-sm text-muted-foreground tabular-nums">
						{incidentPage} / {incidentsTotalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setIncidentPage((currentPage) =>
								Math.min(incidentsTotalPages, currentPage + 1),
							)
						}
						disabled={
							incidentPage >= incidentsTotalPages || incidentsQuery.isFetching
						}
					>
						{m.admin_health_incidents_pagination_next()}
					</Button>
				</div>
			</div>
		</div>
	);
}
