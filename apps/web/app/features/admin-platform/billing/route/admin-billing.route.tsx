import {
	FilterIcon,
	Invoice03Icon,
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
import { Link } from 'react-router';
import type {
	BillingPlanCode,
	BillingSubscriptionStatus,
	BillingTargetType,
} from '@/features/.server/prisma/generated/client';
import {
	formatBillingDate,
	getBillingPlanLabel,
	getBillingTargetTypeLabel,
} from '@/features/admin-platform/billing/components/billing-labels.lib';
import { BillingSubscriptionStatusBadge } from '@/features/admin-platform/billing/components/billing-subscription-status-badge';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-billing.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_billing_meta_title() },
	{ name: 'description', content: m.admin_billing_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const TARGET_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_billing_filter_target_all(),
	},
	{
		value: 'MALL',
		label: () => m.admin_billing_filter_target_mall(),
	},
	{
		value: 'STORE',
		label: () => m.admin_billing_filter_target_store(),
	},
] as const;

const STATUS_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_billing_filter_status_all(),
	},
	{
		value: 'ACTIVE',
		label: () => m.admin_billing_status_active(),
	},
	{
		value: 'OVERDUE',
		label: () => m.admin_billing_status_overdue(),
	},
	{
		value: 'SUSPENDED',
		label: () => m.admin_billing_status_suspended(),
	},
] as const;

const PLAN_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_billing_filter_plan_all(),
	},
	{
		value: 'BASIC',
		label: () => m.admin_billing_plan_basic(),
	},
	{
		value: 'STANDARD',
		label: () => m.admin_billing_plan_standard(),
	},
	{
		value: 'PREMIUM',
		label: () => m.admin_billing_plan_premium(),
	},
] as const;

const SORT_OPTIONS = [
	{
		value: 'updatedAt_desc',
		label: () => m.admin_billing_sort_updated_desc(),
	},
	{
		value: 'updatedAt_asc',
		label: () => m.admin_billing_sort_updated_asc(),
	},
	{
		value: 'nextPaymentDueAt_desc',
		label: () => m.admin_billing_sort_due_desc(),
	},
	{
		value: 'nextPaymentDueAt_asc',
		label: () => m.admin_billing_sort_due_asc(),
	},
] as const;

export default function AdminBillingRoute() {
	const trpc = useTRPC();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [targetFilter, setTargetFilter] = useState<string>('ALL');
	const [statusFilter, setStatusFilter] = useState<string>('ALL');
	const [planFilter, setPlanFilter] = useState<string>('ALL');
	const [sortValue, setSortValue] = useState<string>('updatedAt_desc');
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

	const [sortBy, sortDirection] = sortValue.split('_') as [
		'updatedAt' | 'nextPaymentDueAt',
		'asc' | 'desc',
	];

	const listQuery = useQuery(
		trpc.adminBilling.list.queryOptions({
			page,
			pageSize,
			search: debouncedSearch || undefined,
			targetTypeFilter:
				targetFilter === 'ALL'
					? undefined
					: (targetFilter as BillingTargetType),
			statusFilter:
				statusFilter === 'ALL'
					? undefined
					: (statusFilter as BillingSubscriptionStatus),
			planFilter:
				planFilter === 'ALL' ? undefined : (planFilter as BillingPlanCode),
			sortBy,
			sortDirection,
		}),
	);

	const targetItems = useMemo(
		() =>
			TARGET_FILTER_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);
	const statusItems = useMemo(
		() =>
			STATUS_FILTER_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);
	const planItems = useMemo(
		() =>
			PLAN_FILTER_OPTIONS.map((option) => ({
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
				label: `${size} ${m.admin_billing_rows_per_page()}`,
			})),
		[],
	);

	const subscriptions = listQuery.data?.subscriptions ?? [];
	const total = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;
	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
					<HugeiconsIcon icon={Invoice03Icon} className="size-5 text-primary" />
				</div>
				<div className="flex flex-col gap-0.5">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.admin_billing_title()}
					</h1>
					<p className="text-sm text-muted-foreground">
						{m.admin_billing_subtitle()}
					</p>
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
									placeholder={m.admin_billing_search_placeholder()}
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2">
								<HugeiconsIcon
									icon={FilterIcon}
									className="size-4 text-muted-foreground"
								/>
								<Select
									items={targetItems}
									value={targetFilter}
									onValueChange={(value) => {
										setTargetFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[180px]">
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
									items={statusItems}
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
									items={planItems}
									value={planFilter}
									onValueChange={(value) => {
										setPlanFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PLAN_FILTER_OPTIONS.map((option) => (
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
									<SelectTrigger className="w-[210px]">
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
									{m.admin_billing_total_count({ count: total })}
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
							<TableHead>{m.admin_billing_column_entity()}</TableHead>
							<TableHead>{m.admin_billing_column_target()}</TableHead>
							<TableHead>{m.admin_billing_column_plan()}</TableHead>
							<TableHead>{m.admin_billing_column_status()}</TableHead>
							<TableHead>{m.admin_billing_column_next_due()}</TableHead>
							<TableHead>{m.admin_billing_column_last_payment()}</TableHead>
							<TableHead>{m.admin_billing_column_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{listQuery.isLoading ? (
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow key={`billing-skeleton-${index.toString()}`}>
									<TableCell colSpan={7}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : subscriptions.length > 0 ? (
							subscriptions.map((subscription) => {
								const entityName =
									subscription.targetType === 'MALL'
										? subscription.mall?.name
										: subscription.store?.name;

								return (
									<TableRow key={subscription.id}>
										<TableCell className="font-medium">
											{entityName ?? m.admin_billing_date_not_available()}
										</TableCell>
										<TableCell>
											{getBillingTargetTypeLabel(subscription.targetType)}
										</TableCell>
										<TableCell>
											{getBillingPlanLabel(subscription.planCode)}
										</TableCell>
										<TableCell>
											<BillingSubscriptionStatusBadge
												status={subscription.status}
											/>
										</TableCell>
										<TableCell>
											{formatBillingDate(subscription.nextPaymentDueAt)}
										</TableCell>
										<TableCell>
											{formatBillingDate(subscription.lastPaymentAt)}
										</TableCell>
										<TableCell>
											<Button
												size="sm"
												variant="outline"
												nativeButton={false}
												render={
													<Link
														to={localizeHref(
															`/admin/billing/${subscription.id}`,
														)}
													/>
												}
											>
												{m.admin_billing_action_view_detail()}
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
									{m.admin_billing_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_billing_pagination_info({
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
									{size} {m.admin_billing_rows_per_page()}
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
						disabled={page <= 1 || listQuery.isFetching}
					>
						{m.admin_billing_pagination_previous()}
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
						disabled={page >= totalPages || listQuery.isFetching}
					>
						{m.admin_billing_pagination_next()}
					</Button>
				</div>
			</div>
		</div>
	);
}
