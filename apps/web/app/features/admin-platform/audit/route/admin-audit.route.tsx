import {
	ActivityIcon,
	FilterIcon,
	Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
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
import { getAuditActionLabel } from '@/features/admin-platform/audit/components/audit-action-label.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/admin-audit.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_audit_meta_title() },
	{ name: 'description', content: m.admin_audit_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const SORT_OPTIONS = [
	{
		value: 'desc',
		label: () => m.admin_audit_filter_sort_newest(),
	},
	{
		value: 'asc',
		label: () => m.admin_audit_filter_sort_oldest(),
	},
] as const;

const getEventEntityLabel = (
	targetType: string | null,
	targetId: string | null,
): string => {
	if (!targetType && !targetId) {
		return m.admin_audit_entity_unknown();
	}

	if (targetType && targetId) {
		return `${targetType} · ${targetId}`;
	}

	if (targetType) {
		return targetType;
	}

	return targetId ?? m.admin_audit_entity_unknown();
};

export default function AdminAuditRoute() {
	const trpc = useTRPC();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [actionFilter, setActionFilter] = useState('ALL');
	const [actorFilter, setActorFilter] = useState('');
	const [entityFilter, setEntityFilter] = useState('');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [searchTimer, setSearchTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (searchTimer) {
			clearTimeout(searchTimer);
		}

		const timer = setTimeout(() => {
			setDebouncedSearch(value);
			setPage(1);
		}, 400);

		setSearchTimer(timer);
	};

	const auditQuery = useQuery(
		trpc.adminAudit.list.queryOptions({
			page,
			pageSize,
			search: debouncedSearch || undefined,
			actionFilter: actionFilter === 'ALL' ? undefined : actionFilter,
			actorFilter: actorFilter.trim() || undefined,
			entityFilter: entityFilter.trim() || undefined,
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
			sortDirection,
		}),
	);

	const actionFilterItems = useMemo(
		() => [
			{
				value: 'ALL',
				label: m.admin_audit_filter_action_all(),
			},
			...(auditQuery.data?.actionTypes ?? []).map((action) => ({
				value: action,
				label: getAuditActionLabel(action),
			})),
		],
		[auditQuery.data?.actionTypes],
	);

	const sortItems = useMemo(
		() =>
			SORT_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);

	const pageSizeItems = useMemo(
		() =>
			PAGE_SIZES.map((size) => ({
				value: size.toString(),
				label: `${size} ${m.admin_audit_rows_per_page()}`,
			})),
		[],
	);

	const events = auditQuery.data?.events ?? [];
	const total = auditQuery.data?.total ?? 0;
	const totalPages = auditQuery.data?.totalPages ?? 1;
	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={ActivityIcon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_audit_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_audit_subtitle()}
						</p>
					</div>
				</div>
			</div>

			<Card className="mb-6">
				<CardContent className="pt-4 pb-4">
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<div className="relative flex-1">
								<HugeiconsIcon
									icon={Search01Icon}
									className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									value={search}
									onChange={(event) => handleSearchChange(event.target.value)}
									placeholder={m.admin_audit_search_placeholder()}
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2">
								<HugeiconsIcon
									icon={FilterIcon}
									className="size-4 text-muted-foreground"
								/>
								<Select
									items={actionFilterItems}
									value={actionFilter}
									onValueChange={(value) => {
										setActionFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[260px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{actionFilterItems.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									items={sortItems}
									value={sortDirection}
									onValueChange={(value) => {
										if (value === null) {
											return;
										}

										setSortDirection(value as 'asc' | 'desc');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[190px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SORT_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<Input
								value={actorFilter}
								onChange={(event) => {
									setActorFilter(event.target.value);
									setPage(1);
								}}
								placeholder={m.admin_audit_filter_actor_placeholder()}
							/>
							<Input
								value={entityFilter}
								onChange={(event) => {
									setEntityFilter(event.target.value);
									setPage(1);
								}}
								placeholder={m.admin_audit_filter_entity_placeholder()}
							/>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-muted-foreground">
									{m.admin_audit_filter_date_from()}
								</span>
								<Input
									type="date"
									value={dateFrom}
									onChange={(event) => {
										setDateFrom(event.target.value);
										setPage(1);
									}}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-muted-foreground">
									{m.admin_audit_filter_date_to()}
								</span>
								<Input
									type="date"
									value={dateTo}
									onChange={(event) => {
										setDateTo(event.target.value);
										setPage(1);
									}}
								/>
							</div>
						</div>
						{total > 0 ? (
							<div className="flex justify-end">
								<Badge variant="secondary">
									{m.admin_audit_total_count({ count: total })}
								</Badge>
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.admin_audit_column_timestamp()}</TableHead>
							<TableHead>{m.admin_audit_column_action()}</TableHead>
							<TableHead>{m.admin_audit_column_actor()}</TableHead>
							<TableHead>{m.admin_audit_column_entity()}</TableHead>
							<TableHead>{m.admin_audit_column_outcome()}</TableHead>
							<TableHead>{m.admin_audit_column_metadata()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{auditQuery.isLoading ? (
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow key={`audit-skeleton-${index.toString()}`}>
									<TableCell colSpan={6}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : events.length > 0 ? (
							events.map((event) => (
								<TableRow key={event.id}>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(event.createdAt).toLocaleString()}
									</TableCell>
									<TableCell className="font-medium">
										{getAuditActionLabel(event.action)}
									</TableCell>
									<TableCell>
										{event.actorUser
											? `${event.actorUser.name} (${event.actorUser.email})`
											: m.admin_audit_actor_unknown()}
									</TableCell>
									<TableCell>
										{getEventEntityLabel(event.targetType, event.targetId)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												event.outcome === 'SUCCESS'
													? 'secondary'
													: 'destructive'
											}
										>
											{event.outcome === 'SUCCESS'
												? m.admin_audit_outcome_success()
												: m.admin_audit_outcome_failure()}
										</Badge>
									</TableCell>
									<TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
										{event.metadataJson
											? JSON.stringify(event.metadataJson)
											: m.admin_audit_metadata_empty()}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-muted-foreground"
								>
									{m.admin_audit_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_audit_pagination_info({
								from: from.toString(),
								to: to.toString(),
								total: total.toString(),
							})
						: null}
				</p>
				<div className="flex items-center gap-2">
					<Select
						items={pageSizeItems}
						value={pageSize.toString()}
						onValueChange={(value) => {
							if (value === null) {
								return;
							}

							setPageSize(Number(value));
							setPage(1);
						}}
					>
						<SelectTrigger size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZES.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size} {m.admin_audit_rows_per_page()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((currentPage) => Math.max(1, currentPage - 1))
						}
						disabled={page <= 1 || auditQuery.isFetching}
					>
						{m.admin_audit_pagination_previous()}
					</Button>
					<span className="text-sm text-muted-foreground tabular-nums">
						{page} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((currentPage) => Math.min(totalPages, currentPage + 1))
						}
						disabled={page >= totalPages || auditQuery.isFetching}
					>
						{m.admin_audit_pagination_next()}
					</Button>
				</div>
			</div>
		</div>
	);
}
