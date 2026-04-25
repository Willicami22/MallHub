import {
	FilterIcon,
	Search01Icon,
	TaskDone02Icon,
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
import { Link } from 'react-router';
import { ModerationReportStatusBadge } from '@/features/admin-platform/moderation/components/moderation-report-status-badge';
import {
	getModerationReportTargetLabel,
	type ModerationReportTargetType,
} from '@/features/admin-platform/moderation/components/moderation-report-target-label.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-moderation.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_moderation_meta_title() },
	{ name: 'description', content: m.admin_moderation_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const STATUS_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_moderation_filter_status_all(),
	},
	{
		value: 'OPEN',
		label: () => m.admin_moderation_status_open(),
	},
	{
		value: 'RESOLVED',
		label: () => m.admin_moderation_status_resolved(),
	},
	{
		value: 'DISMISSED',
		label: () => m.admin_moderation_status_dismissed(),
	},
] as const;

const TARGET_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_moderation_filter_target_all(),
	},
	{
		value: 'PRODUCT',
		label: () => m.admin_moderation_target_product(),
	},
	{
		value: 'STORE_PROFILE',
		label: () => m.admin_moderation_target_store_profile(),
	},
	{
		value: 'MALL_PROFILE',
		label: () => m.admin_moderation_target_mall_profile(),
	},
	{
		value: 'STORE_IMAGE',
		label: () => m.admin_moderation_target_store_image(),
	},
	{
		value: 'MALL_IMAGE',
		label: () => m.admin_moderation_target_mall_image(),
	},
] as const;

const SORT_OPTIONS = [
	{
		value: 'createdAt_desc',
		label: () => m.admin_moderation_sort_created_desc(),
	},
	{
		value: 'createdAt_asc',
		label: () => m.admin_moderation_sort_created_asc(),
	},
	{
		value: 'status_asc',
		label: () => m.admin_moderation_sort_status_asc(),
	},
	{
		value: 'status_desc',
		label: () => m.admin_moderation_sort_status_desc(),
	},
	{
		value: 'targetType_asc',
		label: () => m.admin_moderation_sort_target_asc(),
	},
	{
		value: 'targetType_desc',
		label: () => m.admin_moderation_sort_target_desc(),
	},
] as const;

export default function AdminModerationRoute() {
	const trpc = useTRPC();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [targetFilter, setTargetFilter] = useState('ALL');
	const [sortValue, setSortValue] = useState('createdAt_desc');
	const [searchTimer, setSearchTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

	const [sortBy, sortDirection] = sortValue.split('_') as [
		'createdAt' | 'status' | 'targetType',
		'asc' | 'desc',
	];

	const reportsQuery = useQuery(
		trpc.adminModeration.list.queryOptions({
			page,
			pageSize,
			search: debouncedSearch || undefined,
			statusFilter:
				statusFilter === 'ALL'
					? undefined
					: (statusFilter as 'OPEN' | 'RESOLVED' | 'DISMISSED'),
			targetTypeFilter:
				targetFilter === 'ALL'
					? undefined
					: (targetFilter as ModerationReportTargetType),
			sortBy,
			sortDirection,
		}),
	);

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

	const statusFilterItems = useMemo(
		() =>
			STATUS_FILTER_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);
	const targetFilterItems = useMemo(
		() =>
			TARGET_FILTER_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
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
				label: `${size} ${m.admin_moderation_rows_per_page()}`,
			})),
		[],
	);

	const reports = reportsQuery.data?.reports ?? [];
	const total = reportsQuery.data?.total ?? 0;
	const totalPages = reportsQuery.data?.totalPages ?? 1;
	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={TaskDone02Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_moderation_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_moderation_subtitle()}
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
									placeholder={m.admin_moderation_search_placeholder()}
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2">
								<HugeiconsIcon
									icon={FilterIcon}
									className="size-4 text-muted-foreground"
								/>
								<Select
									items={targetFilterItems}
									value={targetFilter}
									onValueChange={(value) => {
										setTargetFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[220px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{TARGET_FILTER_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									items={statusFilterItems}
									value={statusFilter}
									onValueChange={(value) => {
										setStatusFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{STATUS_FILTER_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									items={sortItems}
									value={sortValue}
									onValueChange={(value) => {
										if (value === null) {
											return;
										}

										setSortValue(value);
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[220px]">
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
						{total > 0 ? (
							<div className="flex justify-end">
								<Badge variant="secondary">
									{m.admin_moderation_total_count({ count: total })}
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
							<TableHead>{m.admin_moderation_column_target()}</TableHead>
							<TableHead>{m.admin_moderation_column_type()}</TableHead>
							<TableHead>{m.admin_moderation_column_reason()}</TableHead>
							<TableHead>{m.admin_moderation_column_status()}</TableHead>
							<TableHead>{m.admin_moderation_column_reported_by()}</TableHead>
							<TableHead>{m.admin_moderation_column_created_at()}</TableHead>
							<TableHead>{m.admin_moderation_column_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reportsQuery.isLoading ? (
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow key={`moderation-skeleton-${index.toString()}`}>
									<TableCell colSpan={7}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : reports.length > 0 ? (
							reports.map((report) => {
								const targetName =
									report.product?.name ??
									report.store?.name ??
									report.mall?.name ??
									m.admin_moderation_target_unknown();

								return (
									<TableRow key={report.id}>
										<TableCell className="font-medium">{targetName}</TableCell>
										<TableCell>
											{getModerationReportTargetLabel(report.targetType)}
										</TableCell>
										<TableCell className="max-w-[360px] truncate">
											{report.reason}
										</TableCell>
										<TableCell>
											<ModerationReportStatusBadge status={report.status} />
										</TableCell>
										<TableCell>
											{report.reportedByUser
												? `${report.reportedByUser.name} (${report.reportedByUser.email})`
												: m.admin_moderation_reported_by_unknown()}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{new Date(report.createdAt).toLocaleString()}
										</TableCell>
										<TableCell>
											<Button
												size="sm"
												variant="outline"
												nativeButton={false}
												render={
													<Link
														to={localizeHref(`/admin/moderation/${report.id}`)}
													/>
												}
											>
												{m.admin_moderation_action_view_detail()}
											</Button>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-24 text-center text-muted-foreground"
								>
									{m.admin_moderation_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_moderation_pagination_info({
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
									{size} {m.admin_moderation_rows_per_page()}
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
						disabled={page <= 1 || reportsQuery.isFetching}
					>
						{m.admin_moderation_pagination_previous()}
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
						disabled={page >= totalPages || reportsQuery.isFetching}
					>
						{m.admin_moderation_pagination_next()}
					</Button>
				</div>
			</div>
		</div>
	);
}
