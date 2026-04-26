import {
	FilterIcon,
	Search01Icon,
	UserAdd01Icon,
	UserGroupIcon,
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
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import type { UserRole } from '@/features/.server/prisma/generated/client';
import type { TanStackZodError } from '@/features/.server/trpc/trpc.init';
import { AssignAdminCcDialog } from '@/features/admin-platform/users/components/assign-admin-cc-dialog';
import { BanUserDialog } from '@/features/admin-platform/users/components/ban-user-dialog';
import { CreateUserDialog } from '@/features/admin-platform/users/components/create-user-dialog';
import { SetRoleDialog } from '@/features/admin-platform/users/components/set-role-dialog';
import { UsersDataTable } from '@/features/admin-platform/users/components/users-data-table';
import {
	getUserColumns,
	type UserRow,
} from '@/features/admin-platform/users/components/users-table-columns';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/admin-users.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_users_meta_title() },
	{ name: 'description', content: m.admin_users_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const ROLE_FILTER_OPTIONS = [
	{ value: 'ALL', label: () => m.admin_users_filter_all_roles() },
	{ value: appRoles.CUSTOMER, label: () => m.admin_users_role_customer() },
	{
		value: appRoles.ADMIN_LOCAL,
		label: () => m.admin_users_role_admin_local(),
	},
	{ value: appRoles.ADMIN_CC, label: () => m.admin_users_role_admin_cc() },
	{
		value: appRoles.ADMIN_PLATFORM,
		label: () => m.admin_users_role_admin_platform(),
	},
] as const;

export default function AdminUsersRoute() {
	const session = useAppSession();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const canManageUsers = session.data?.user.role === appRoles.ADMIN_PLATFORM;

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('ALL');
	const roleFilterItems = ROLE_FILTER_OPTIONS.map((opt) => ({
		value: opt.value,
		label: opt.label(),
	}));
	const pageSizeOptions = PAGE_SIZES.map((size) => ({
		value: size.toString(),
		label: `${size} ${m.admin_users_rows_per_page()}`,
	}));
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'createdAt', desc: true },
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const [banTarget, setBanTarget] = useState<UserRow | null>(null);
	const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);
	const [assignmentTarget, setAssignmentTarget] = useState<UserRow | null>(
		null,
	);
	const [createFieldErrors, setCreateFieldErrors] =
		useState<TanStackZodError | null>(null);

	// Debounced search
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

	const sortBy = sorting[0]?.id as
		| 'name'
		| 'email'
		| 'role'
		| 'createdAt'
		| undefined;
	const sortDirection = sorting[0]?.desc ? 'desc' : 'asc';

	const listQueryOptions = trpc.adminUsers.list.queryOptions({
		page,
		pageSize,
		search: debouncedSearch || undefined,
		roleFilter: roleFilter !== 'ALL' ? (roleFilter as UserRole) : undefined,
		sortBy: sortBy ?? 'createdAt',
		sortDirection,
	});
	const { data, isLoading, isFetching } = useQuery({
		...listQueryOptions,
		enabled: canManageUsers,
	});

	const invalidateUsers = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminUsers.pathKey(),
		});
	}, [queryClient, trpc]);

	const invalidateAssignments = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminCcAssignments.pathKey(),
		});
	}, [queryClient, trpc]);

	// Mutations
	const createUserMutation = useMutation(
		trpc.adminUsers.create.mutationOptions({
			onSuccess: async () => {
				setCreateFieldErrors(null);
				await invalidateUsers();
			},
			onError: (error) => {
				const zodError = (error.data as { zodError?: TanStackZodError })
					?.zodError;
				if (zodError) setCreateFieldErrors(zodError);
			},
		}),
	);

	const banUserMutation = useMutation(
		trpc.adminUsers.ban.mutationOptions({
			onSuccess: async () => {
				setBanTarget(null);
				await invalidateUsers();
			},
		}),
	);

	const unbanUserMutation = useMutation(
		trpc.adminUsers.unban.mutationOptions({
			onSuccess: invalidateUsers,
		}),
	);

	const setRoleMutation = useMutation(
		trpc.adminUsers.setRole.mutationOptions({
			onSuccess: async () => {
				setRoleTarget(null);
				await invalidateUsers();
			},
		}),
	);

	const createAdminCcAssignmentMutation = useMutation(
		trpc.adminCcAssignments.create.mutationOptions({
			onSuccess: async () => {
				setAssignmentTarget(null);
				await Promise.all([invalidateAssignments(), invalidateUsers()]);
			},
		}),
	);

	const columns = useMemo(
		() =>
			getUserColumns({
				onBan: (user) => setBanTarget(user),
				onUnban: async (user) => {
					await unbanUserMutation.mutateAsync({ userId: user.id });
				},
				onSetRole: (user) => setRoleTarget(user),
				onAssignMall: (user) => setAssignmentTarget(user),
			}),
		[unbanUserMutation],
	);

	const users = data?.users ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);

	if (!canManageUsers) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardContent className="py-6">
						<p className="text-sm text-muted-foreground">
							{m.trpc_error_forbidden()}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			{/* Header */}
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={UserGroupIcon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_users_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_users_subtitle()}
						</p>
					</div>
				</div>
				<CreateUserDialog
					trigger={
						<Button size="sm">
							<HugeiconsIcon icon={UserAdd01Icon} data-icon="inline-start" />
							{m.admin_users_create_button()}
						</Button>
					}
					onSubmit={async (formData) => {
						setCreateFieldErrors(null);
						await createUserMutation.mutateAsync({
							name: formData.name,
							email: formData.email,
							password: formData.password,
							role: formData.role,
						});
					}}
					isSubmitting={createUserMutation.isPending}
					fieldErrors={createFieldErrors}
				/>
			</div>

			{/* Filters */}
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
								onChange={(e) => handleSearchChange(e.target.value)}
								placeholder={m.admin_users_search_placeholder()}
								className="pl-9"
							/>
						</div>
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={FilterIcon}
								className="size-4 text-muted-foreground"
							/>
							<Select
								items={roleFilterItems}
								value={roleFilter}
								onValueChange={(val) => {
									setRoleFilter(val ?? 'ALL');
									setPage(1);
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ROLE_FILTER_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{total > 0 && (
							<Badge variant="secondary" className="shrink-0">
								{m.admin_users_total_count({ count: total })}
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<UsersDataTable
				columns={columns}
				data={users}
				pageCount={totalPages}
				pageIndex={page - 1}
				pageSize={pageSize}
				sorting={sorting}
				columnFilters={columnFilters}
				onSortingChange={setSorting}
				onColumnFiltersChange={setColumnFilters}
				isLoading={isLoading}
			/>

			{/* Pagination */}
			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_users_pagination_info({
								from: from.toString(),
								to: to.toString(),
								total: total.toString(),
							})
						: null}
				</p>
				<div className="flex items-center gap-2">
					<Select
						items={pageSizeOptions}
						value={pageSize.toString()}
						onValueChange={(val) => {
							if (val === null) return;
							setPageSize(Number(val));
							setPage(1);
						}}
					>
						<SelectTrigger size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZES.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size} {m.admin_users_rows_per_page()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page <= 1 || isFetching}
					>
						{m.admin_users_pagination_previous()}
					</Button>
					<span className="text-sm text-muted-foreground tabular-nums">
						{page} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page >= totalPages || isFetching}
					>
						{m.admin_users_pagination_next()}
					</Button>
				</div>
			</div>

			{/* Ban dialog */}
			<BanUserDialog
				open={!!banTarget}
				onOpenChange={(open) => {
					if (!open) setBanTarget(null);
				}}
				userName={banTarget?.name ?? ''}
				onConfirm={async (reason) => {
					if (!banTarget) return;
					await banUserMutation.mutateAsync({
						userId: banTarget.id,
						banReason: reason || undefined,
					});
				}}
				isSubmitting={banUserMutation.isPending}
			/>

			{/* Set role dialog */}
			<SetRoleDialog
				open={!!roleTarget}
				onOpenChange={(open) => {
					if (!open) setRoleTarget(null);
				}}
				userName={roleTarget?.name ?? ''}
				currentRole={roleTarget?.role ?? 'CUSTOMER'}
				onConfirm={async (role) => {
					if (!roleTarget) return;
					await setRoleMutation.mutateAsync({
						userId: roleTarget.id,
						role,
					});
				}}
				isSubmitting={setRoleMutation.isPending}
			/>

			<AssignAdminCcDialog
				open={!!assignmentTarget}
				onOpenChange={(open) => {
					if (!open) {
						setAssignmentTarget(null);
					}
				}}
				adminCcUserId={assignmentTarget?.id ?? ''}
				adminCcUserName={assignmentTarget?.name ?? ''}
				onConfirm={async ({ adminCcUserId, mallId }) => {
					await createAdminCcAssignmentMutation.mutateAsync({
						adminCcUserId,
						mallId,
					});
				}}
				isSubmitting={createAdminCcAssignmentMutation.isPending}
			/>
		</div>
	);
}
