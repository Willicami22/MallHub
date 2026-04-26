import {
	FilterIcon,
	Search01Icon,
	ShoppingBag01Icon,
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldError,
	FieldLabel,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { StoreStatus } from '@/features/.server/prisma/generated/client';
import { getBillingPlanLabel } from '@/features/admin-platform/billing/components/billing-labels.lib';
import {
	REJECT_STORE_REGISTRATION_FORM_OPTIONS,
	toRejectStoreRegistrationSubmitData,
	useRejectStoreRegistrationForm,
} from '@/features/admin-platform/stores/components/reject-store-registration.form';
import { StoreStatusBadge } from '@/features/admin-platform/stores/components/store-status-badge';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-stores.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_stores_meta_title() },
	{ name: 'description', content: m.admin_stores_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const STATUS_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_stores_filter_status_all(),
	},
	{
		value: 'DRAFT',
		label: () => m.admin_stores_status_draft(),
	},
	{
		value: 'PENDING_APPROVAL',
		label: () => m.admin_stores_status_pending_approval(),
	},
	{
		value: 'ACTIVE',
		label: () => m.admin_stores_status_active(),
	},
	{
		value: 'REJECTED',
		label: () => m.admin_stores_status_rejected(),
	},
	{
		value: 'SUSPENDED',
		label: () => m.admin_stores_status_suspended(),
	},
] as const;

const PLAN_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_stores_filter_plan_all(),
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
		value: 'createdAt_desc',
		label: () => m.admin_stores_sort_created_desc(),
	},
	{
		value: 'createdAt_asc',
		label: () => m.admin_stores_sort_created_asc(),
	},
	{
		value: 'name_asc',
		label: () => m.admin_stores_sort_name_asc(),
	},
	{
		value: 'name_desc',
		label: () => m.admin_stores_sort_name_desc(),
	},
	{
		value: 'status_asc',
		label: () => m.admin_stores_sort_status_asc(),
	},
	{
		value: 'status_desc',
		label: () => m.admin_stores_sort_status_desc(),
	},
	{
		value: 'mallName_asc',
		label: () => m.admin_stores_sort_mall_asc(),
	},
	{
		value: 'mallName_desc',
		label: () => m.admin_stores_sort_mall_desc(),
	},
] as const;

export default function AdminStoresRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [mallFilter, setMallFilter] = useState<string>('ALL');
	const [statusFilter, setStatusFilter] = useState<string>('ALL');
	const [planFilter, setPlanFilter] = useState<string>('ALL');
	const [sortValue, setSortValue] = useState<string>('createdAt_desc');
	const [searchTimer, setSearchTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);
	const [rejectTarget, setRejectTarget] = useState<{
		id: string;
		storeName: string;
	} | null>(null);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (searchTimer) clearTimeout(searchTimer);
		const timer = setTimeout(() => {
			setDebouncedSearch(value);
			setPage(1);
		}, 400);
		setSearchTimer(timer);
	};

	const [sortBy, sortDirection] = sortValue.split('_') as [
		'name' | 'status' | 'createdAt' | 'mallName',
		'asc' | 'desc',
	];

	const mallsQuery = useQuery(
		trpc.adminMalls.list.queryOptions({
			page: 1,
			pageSize: 100,
			sortBy: 'name',
			sortDirection: 'asc',
		}),
	);

	const mallItems = useMemo(
		() => [
			{
				value: 'ALL',
				label: m.admin_stores_filter_mall_all(),
			},
			...(mallsQuery.data?.malls ?? []).map((mall) => ({
				value: mall.id,
				label: mall.name,
			})),
		],
		[mallsQuery.data?.malls],
	);
	const statusFilterItems = STATUS_FILTER_OPTIONS.map((option) => ({
		value: option.value,
		label: option.label(),
	}));
	const planFilterItems = PLAN_FILTER_OPTIONS.map((option) => ({
		value: option.value,
		label: option.label(),
	}));
	const sortItems = SORT_OPTIONS.map((option) => ({
		value: option.value,
		label: option.label(),
	}));
	const pageSizeItems = PAGE_SIZES.map((size) => ({
		value: size.toString(),
		label: `${size} ${m.admin_stores_rows_per_page()}`,
	}));

	const storesQuery = useQuery(
		trpc.adminStores.list.queryOptions({
			page,
			pageSize,
			search: debouncedSearch || undefined,
			mallId: mallFilter === 'ALL' ? undefined : mallFilter,
			statusFilter:
				statusFilter === 'ALL' ? undefined : (statusFilter as StoreStatus),
			planFilter:
				planFilter === 'ALL'
					? undefined
					: (planFilter as 'BASIC' | 'STANDARD' | 'PREMIUM' | undefined),
			sortBy,
			sortDirection,
		}),
	);

	const pendingRegistrationsQuery = useQuery(
		trpc.adminStoreRegistrations.list.queryOptions({
			page: 1,
			pageSize: 10,
			search: debouncedSearch || undefined,
			mallId: mallFilter === 'ALL' ? undefined : mallFilter,
			statusFilter: 'PENDING',
			sortBy: 'createdAt',
			sortDirection: 'asc',
		}),
	);

	const invalidateStoreData = useCallback(async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.adminStores.pathKey(),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.adminStoreRegistrations.pathKey(),
			}),
		]);
	}, [queryClient, trpc]);

	const approveStoreRegistrationMutation = useMutation(
		trpc.adminStoreRegistrations.approve.mutationOptions({
			onSuccess: invalidateStoreData,
		}),
	);

	const rejectStoreRegistrationMutation = useMutation(
		trpc.adminStoreRegistrations.reject.mutationOptions({
			onSuccess: async () => {
				await invalidateStoreData();
				setRejectTarget(null);
			},
		}),
	);

	const rejectStoreRegistrationForm = useRejectStoreRegistrationForm({
		...REJECT_STORE_REGISTRATION_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			if (!rejectTarget) {
				return;
			}

			const submitData = toRejectStoreRegistrationSubmitData(value);
			if (!submitData) {
				return;
			}

			await rejectStoreRegistrationMutation.mutateAsync({
				registrationRequestId: rejectTarget.id,
				reason: submitData.reason,
			});
			formApi.reset();
		},
	});

	const handleRejectRegistrationSubmit = (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		void rejectStoreRegistrationForm.handleSubmit();
	};

	const stores = storesQuery.data?.stores ?? [];
	const total = storesQuery.data?.total ?? 0;
	const totalPages = storesQuery.data?.totalPages ?? 1;
	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);
	const pendingRegistrations =
		pendingRegistrationsQuery.data?.registrationRequests ?? [];

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={ShoppingBag01Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_stores_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_stores_subtitle()}
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
									placeholder={m.admin_stores_search_placeholder()}
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2">
								<HugeiconsIcon
									icon={FilterIcon}
									className="size-4 text-muted-foreground"
								/>
								<Select
									items={mallItems}
									value={mallFilter}
									onValueChange={(value) => {
										setMallFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[200px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{mallItems.map((item) => (
											<SelectItem key={item.value} value={item.value}>
												{item.label}
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
									<SelectTrigger className="w-[190px]">
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
									items={planFilterItems}
									value={planFilter}
									onValueChange={(value) => {
										setPlanFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[190px]">
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
										if (value === null) return;
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
									{m.admin_stores_total_count({ count: total })}
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
							<TableHead>{m.admin_stores_column_name()}</TableHead>
							<TableHead>{m.admin_stores_column_mall()}</TableHead>
							<TableHead>{m.admin_stores_column_plan()}</TableHead>
							<TableHead>{m.admin_stores_column_status()}</TableHead>
							<TableHead>{m.admin_stores_column_owner()}</TableHead>
							<TableHead>{m.admin_stores_column_created_at()}</TableHead>
							<TableHead>{m.admin_stores_column_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{storesQuery.isLoading ? (
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow key={`store-skeleton-${index.toString()}`}>
									<TableCell colSpan={7}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : stores.length > 0 ? (
							stores.map((store) => (
								<TableRow key={store.id}>
									<TableCell className="font-medium">{store.name}</TableCell>
									<TableCell>{store.mall.name}</TableCell>
									<TableCell>
										{store.activePlan
											? getBillingPlanLabel(store.activePlan.planCode)
											: m.admin_stores_plan_not_configured()}
									</TableCell>
									<TableCell>
										<StoreStatusBadge status={store.status} />
									</TableCell>
									<TableCell>
										{store.owner
											? `${store.owner.name} (${store.owner.email})`
											: m.admin_stores_owner_unassigned()}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(store.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<Button
											size="sm"
											variant="outline"
											nativeButton={false}
											render={
												<Link to={localizeHref(`/admin/stores/${store.id}`)} />
											}
										>
											{m.admin_stores_action_view_detail()}
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-24 text-center text-muted-foreground"
								>
									{m.admin_stores_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 mb-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_stores_pagination_info({
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
							if (value === null) return;
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
									{size} {m.admin_stores_rows_per_page()}
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
						disabled={page <= 1 || storesQuery.isFetching}
					>
						{m.admin_stores_pagination_previous()}
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
						disabled={page >= totalPages || storesQuery.isFetching}
					>
						{m.admin_stores_pagination_next()}
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-2">
						<div className="flex flex-col gap-0.5">
							<CardTitle>{m.admin_store_registrations_title()}</CardTitle>
							<CardDescription>
								{m.admin_store_registrations_subtitle()}
							</CardDescription>
						</div>
						<Badge variant="secondary">
							{pendingRegistrations.length.toString()}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="overflow-hidden rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										{m.admin_store_registrations_column_store()}
									</TableHead>
									<TableHead>
										{m.admin_store_registrations_column_mall()}
									</TableHead>
									<TableHead>
										{m.admin_store_registrations_column_applicant()}
									</TableHead>
									<TableHead>
										{m.admin_store_registrations_column_requested_at()}
									</TableHead>
									<TableHead>
										{m.admin_store_registrations_column_actions()}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pendingRegistrationsQuery.isLoading ? (
									Array.from({ length: 4 }).map((_, index) => (
										<TableRow key={`registration-skeleton-${index.toString()}`}>
											<TableCell colSpan={5}>
												<div className="h-4 w-48 animate-pulse rounded bg-muted" />
											</TableCell>
										</TableRow>
									))
								) : pendingRegistrations.length > 0 ? (
									pendingRegistrations.map((request) => (
										<TableRow key={request.id}>
											<TableCell className="font-medium">
												{request.storeName}
											</TableCell>
											<TableCell>{request.mall.name}</TableCell>
											<TableCell>
												{request.applicant.name} ({request.applicant.email})
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{new Date(request.createdAt).toLocaleString()}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button
														size="sm"
														onClick={() => {
															void approveStoreRegistrationMutation.mutateAsync(
																{
																	registrationRequestId: request.id,
																},
															);
														}}
														disabled={
															approveStoreRegistrationMutation.isPending
														}
													>
														{approveStoreRegistrationMutation.isPending ? (
															<>
																<Spinner />
																{m.admin_store_registrations_approve_submitting()}
															</>
														) : (
															m.admin_store_registrations_approve_button()
														)}
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => {
															setRejectTarget({
																id: request.id,
																storeName: request.storeName,
															});
														}}
														disabled={rejectStoreRegistrationMutation.isPending}
													>
														{m.admin_store_registrations_reject_button()}
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className="h-24 text-center text-muted-foreground"
										>
											{m.admin_store_registrations_empty()}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{approveStoreRegistrationMutation.error ? (
						<p className="mt-4 text-sm text-destructive">
							{approveStoreRegistrationMutation.error.message}
						</p>
					) : null}
				</CardContent>
			</Card>

			<Dialog
				open={!!rejectTarget}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						setRejectTarget(null);
						rejectStoreRegistrationForm.reset();
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{m.admin_store_registrations_reject_dialog_title()}
						</DialogTitle>
						<DialogDescription>
							{m.admin_store_registrations_reject_dialog_description({
								storeName: rejectTarget?.storeName ?? '',
							})}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleRejectRegistrationSubmit} className="space-y-5">
						<rejectStoreRegistrationForm.Field name="reason">
							{(reasonField) => {
								const isInvalid =
									reasonField.state.meta.isTouched &&
									!reasonField.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="reject-registration-reason">
											{m.admin_store_registrations_reject_reason_label()}
										</FieldLabel>
										<Input
											id="reject-registration-reason"
											value={reasonField.state.value}
											onChange={(event) =>
												reasonField.handleChange(event.target.value)
											}
											onBlur={reasonField.handleBlur}
											placeholder={m.admin_store_registrations_reject_reason_placeholder()}
											aria-invalid={isInvalid}
											disabled={rejectStoreRegistrationMutation.isPending}
										/>
										<FieldError errors={reasonField.state.meta.errors} />
									</Field>
								);
							}}
						</rejectStoreRegistrationForm.Field>
						{rejectStoreRegistrationMutation.error ? (
							<p className="text-sm text-destructive">
								{rejectStoreRegistrationMutation.error.message}
							</p>
						) : null}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setRejectTarget(null);
									rejectStoreRegistrationForm.reset();
								}}
							>
								{m.admin_malls_cancel()}
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={rejectStoreRegistrationMutation.isPending}
							>
								{rejectStoreRegistrationMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_store_registrations_reject_submitting()}
									</>
								) : (
									m.admin_store_registrations_reject_confirm()
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
