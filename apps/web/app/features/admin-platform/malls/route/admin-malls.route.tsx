import {
	Building04Icon,
	FilterIcon,
	Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
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
import { MallStatusBadge } from '@/features/admin-platform/malls/components/mall-status-badge';
import {
	getMallUpsertFormDefaultValues,
	MALL_UPSERT_FORM_OPTIONS,
	toMallUpsertSubmitData,
	useMallUpsertForm,
} from '@/features/admin-platform/malls/components/mall-upsert.form';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-malls.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_malls_meta_title() },
	{ name: 'description', content: m.admin_malls_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const STATUS_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_malls_filter_status_all(),
	},
	{
		value: 'ACTIVE',
		label: () => m.admin_malls_status_active(),
	},
	{
		value: 'INACTIVE',
		label: () => m.admin_malls_status_inactive(),
	},
	{
		value: 'SUSPENDED',
		label: () => m.admin_malls_status_suspended(),
	},
] as const;

const SORT_OPTIONS = [
	{
		value: 'createdAt_desc',
		label: () => m.admin_malls_sort_created_desc(),
	},
	{
		value: 'createdAt_asc',
		label: () => m.admin_malls_sort_created_asc(),
	},
	{
		value: 'name_asc',
		label: () => m.admin_malls_sort_name_asc(),
	},
	{
		value: 'name_desc',
		label: () => m.admin_malls_sort_name_desc(),
	},
	{
		value: 'city_asc',
		label: () => m.admin_malls_sort_city_asc(),
	},
	{
		value: 'city_desc',
		label: () => m.admin_malls_sort_city_desc(),
	},
] as const;

export default function AdminMallsRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('ALL');
	const [adminCcSearch, setAdminCcSearch] = useState('');
	const [sortValue, setSortValue] = useState<string>('createdAt_desc');
	const [searchTimer, setSearchTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

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
		'name' | 'city' | 'createdAt' | 'status',
		'asc' | 'desc',
	];

	const statusFilterItems = STATUS_FILTER_OPTIONS.map((option) => ({
		value: option.value,
		label: option.label(),
	}));
	const sortItems = SORT_OPTIONS.map((option) => ({
		value: option.value,
		label: option.label(),
	}));
	const pageSizeItems = PAGE_SIZES.map((size) => ({
		value: size.toString(),
		label: `${size} ${m.admin_malls_rows_per_page()}`,
	}));

	const listQuery = useQuery(
		trpc.adminMalls.list.queryOptions({
			page,
			pageSize,
			search: debouncedSearch || undefined,
			statusFilter:
				statusFilter === 'ALL'
					? undefined
					: (statusFilter as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'),
			sortBy,
			sortDirection,
		}),
	);

	const adminCcUsersQuery = useQuery(
		trpc.adminUsers.list.queryOptions({
			page: 1,
			pageSize: 20,
			search: adminCcSearch.trim().length ? adminCcSearch.trim() : undefined,
			roleFilter: appRoles.ADMIN_CC,
			sortBy: 'name',
			sortDirection: 'asc',
		}),
	);

	const assignableAdminCcUsers = useMemo(
		() => (adminCcUsersQuery.data?.users ?? []).filter((user) => !user.banned),
		[adminCcUsersQuery.data?.users],
	);
	const adminCcItems = useMemo(
		() => [
			{
				value: 'UNASSIGNED',
				label: m.admin_malls_admin_cc_unassigned(),
			},
			...assignableAdminCcUsers.map((user) => ({
				value: user.id,
				label: `${user.name} (${user.email})`,
			})),
		],
		[assignableAdminCcUsers],
	);

	const invalidateMalls = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminMalls.pathKey(),
		});
	}, [queryClient, trpc]);

	const createMallMutation = useMutation(
		trpc.adminMalls.create.mutationOptions({
			onSuccess: async () => {
				await invalidateMalls();
			},
		}),
	);

	const createMallForm = useMallUpsertForm({
		...MALL_UPSERT_FORM_OPTIONS,
		defaultValues: getMallUpsertFormDefaultValues(),
		onSubmit: async ({ value, formApi }) => {
			const submitData = toMallUpsertSubmitData(value);
			if (!submitData) {
				return;
			}

			await createMallMutation.mutateAsync({
				name: submitData.name,
				city: submitData.city,
				address: submitData.address,
				description: submitData.description,
				adminCcUserId: submitData.adminCcUserId,
			});
			formApi.reset();
			setPage(1);
		},
	});

	const handleCreateMallSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void createMallForm.handleSubmit();
	};

	const malls = listQuery.data?.malls ?? [];
	const total = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;
	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={Building04Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_malls_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_malls_subtitle()}
						</p>
					</div>
				</div>
			</div>

			<Card className="mb-6">
				<CardContent className="pt-4">
					<form onSubmit={handleCreateMallSubmit} className="grid gap-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<createMallForm.Field name="name">
								{(nameField) => {
									const isInvalid =
										nameField.state.meta.isTouched &&
										!nameField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-mall-name">
												{m.admin_malls_form_name_label()}
											</FieldLabel>
											<Input
												id="create-mall-name"
												value={nameField.state.value}
												onChange={(event) =>
													nameField.handleChange(event.target.value)
												}
												onBlur={nameField.handleBlur}
												placeholder={m.admin_malls_form_name_placeholder()}
												aria-invalid={isInvalid}
												disabled={createMallMutation.isPending}
												required
											/>
											<FieldError errors={nameField.state.meta.errors} />
										</Field>
									);
								}}
							</createMallForm.Field>

							<createMallForm.Field name="city">
								{(cityField) => {
									const isInvalid =
										cityField.state.meta.isTouched &&
										!cityField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-mall-city">
												{m.admin_malls_form_city_label()}
											</FieldLabel>
											<Input
												id="create-mall-city"
												value={cityField.state.value}
												onChange={(event) =>
													cityField.handleChange(event.target.value)
												}
												onBlur={cityField.handleBlur}
												placeholder={m.admin_malls_form_city_placeholder()}
												aria-invalid={isInvalid}
												disabled={createMallMutation.isPending}
												required
											/>
											<FieldError errors={cityField.state.meta.errors} />
										</Field>
									);
								}}
							</createMallForm.Field>

							<createMallForm.Field name="address">
								{(addressField) => {
									const isInvalid =
										addressField.state.meta.isTouched &&
										!addressField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-mall-address">
												{m.admin_malls_form_address_label()}
											</FieldLabel>
											<Input
												id="create-mall-address"
												value={addressField.state.value}
												onChange={(event) =>
													addressField.handleChange(event.target.value)
												}
												onBlur={addressField.handleBlur}
												placeholder={m.admin_malls_form_address_placeholder()}
												aria-invalid={isInvalid}
												disabled={createMallMutation.isPending}
												required
											/>
											<FieldError errors={addressField.state.meta.errors} />
										</Field>
									);
								}}
							</createMallForm.Field>

							<createMallForm.Field name="adminCcUserId">
								{(adminCcUserIdField) => {
									const isInvalid =
										adminCcUserIdField.state.meta.isTouched &&
										!adminCcUserIdField.state.meta.isValid;
									const selectedValue = adminCcUserIdField.state.value.length
										? adminCcUserIdField.state.value
										: 'UNASSIGNED';

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												{m.admin_malls_form_admin_cc_label()}
											</FieldLabel>
											<Input
												value={adminCcSearch}
												onChange={(event) =>
													setAdminCcSearch(event.target.value)
												}
												placeholder={m.admin_malls_form_admin_cc_search_placeholder()}
												className="mb-2"
											/>
											<Select
												items={adminCcItems}
												value={selectedValue}
												onValueChange={(value) =>
													adminCcUserIdField.handleChange(
														value === null || value === 'UNASSIGNED'
															? ''
															: value,
													)
												}
												disabled={
													createMallMutation.isPending ||
													adminCcUsersQuery.isLoading
												}
											>
												<SelectTrigger aria-invalid={isInvalid}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{adminCcItems.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError
												errors={adminCcUserIdField.state.meta.errors}
											/>
										</Field>
									);
								}}
							</createMallForm.Field>

							<createMallForm.Field name="description">
								{(descriptionField) => {
									const isInvalid =
										descriptionField.state.meta.isTouched &&
										!descriptionField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-mall-description">
												{m.admin_malls_form_description_label()}
											</FieldLabel>
											<Input
												id="create-mall-description"
												value={descriptionField.state.value}
												onChange={(event) =>
													descriptionField.handleChange(event.target.value)
												}
												onBlur={descriptionField.handleBlur}
												placeholder={m.admin_malls_form_description_placeholder()}
												aria-invalid={isInvalid}
												disabled={createMallMutation.isPending}
											/>
											<FieldError errors={descriptionField.state.meta.errors} />
										</Field>
									);
								}}
							</createMallForm.Field>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="text-sm text-muted-foreground">
								{m.admin_malls_create_hint()}
							</p>
							<Button type="submit" disabled={createMallMutation.isPending}>
								{createMallMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_malls_create_submitting()}
									</>
								) : (
									m.admin_malls_create_button()
								)}
							</Button>
						</div>
						{createMallMutation.error ? (
							<p className="text-sm text-destructive">
								{createMallMutation.error.message}
							</p>
						) : null}
					</form>
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardContent className="pt-4 pb-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								value={search}
								onChange={(event) => handleSearchChange(event.target.value)}
								placeholder={m.admin_malls_search_placeholder()}
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
								items={sortItems}
								value={sortValue}
								onValueChange={(value) => {
									if (value === null) return;
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
						{total > 0 ? (
							<Badge variant="secondary">
								{m.admin_malls_total_count({ count: total })}
							</Badge>
						) : null}
					</div>
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.admin_malls_column_name()}</TableHead>
							<TableHead>{m.admin_malls_column_city()}</TableHead>
							<TableHead>{m.admin_malls_column_status()}</TableHead>
							<TableHead>{m.admin_malls_column_active_stores()}</TableHead>
							<TableHead>{m.admin_malls_column_admin_cc()}</TableHead>
							<TableHead>{m.admin_malls_column_created_at()}</TableHead>
							<TableHead>{m.admin_malls_column_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{listQuery.isLoading ? (
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow key={`skeleton-${index.toString()}`}>
									<TableCell colSpan={7}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : malls.length > 0 ? (
							malls.map((mall) => (
								<TableRow key={mall.id}>
									<TableCell className="font-medium">{mall.name}</TableCell>
									<TableCell>{mall.city}</TableCell>
									<TableCell>
										<MallStatusBadge status={mall.status} />
									</TableCell>
									<TableCell className="tabular-nums">
										{mall.activeStoreCount}
									</TableCell>
									<TableCell>
										{mall.adminCcUser
											? mall.adminCcUser.name
											: m.admin_malls_admin_cc_unassigned()}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(mall.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<Button
											size="sm"
											variant="outline"
											nativeButton={false}
											render={
												<Link to={localizeHref(`/admin/malls/${mall.id}`)} />
											}
										>
											{m.admin_malls_action_view_detail()}
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
									{m.admin_malls_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_malls_pagination_info({
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
									{size} {m.admin_malls_rows_per_page()}
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
						{m.admin_malls_pagination_previous()}
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
						{m.admin_malls_pagination_next()}
					</Button>
				</div>
			</div>
		</div>
	);
}
