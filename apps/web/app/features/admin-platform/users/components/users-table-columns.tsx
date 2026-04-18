import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	Cancel01Icon,
	MoreHorizontalIcon,
	SecurityCheckIcon,
	ShieldKeyIcon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@mallhub/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserRole } from '@/features/.server/prisma/generated/client';
import { isAdminPlatformProtectedUserRole } from '@/features/admin-platform/users/admin-users-policy.lib';
import * as m from '@/paraglide/messages.js';

export type UserRow = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: UserRole;
	banned: boolean | null;
	banReason: string | null;
	banExpires: Date | null;
	emailVerified: boolean;
	createdAt: Date;
};

const ROLE_LABELS: Record<UserRole, () => string> = {
	CUSTOMER: () => m.admin_users_role_customer(),
	ADMIN_LOCAL: () => m.admin_users_role_admin_local(),
	ADMIN_CC: () => m.admin_users_role_admin_cc(),
	ADMIN_PLATFORM: () => m.admin_users_role_admin_platform(),
};

const ROLE_VARIANTS: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
	ADMIN_PLATFORM: 'default',
	ADMIN_CC: 'default',
	ADMIN_LOCAL: 'secondary',
	CUSTOMER: 'outline',
};

function getInitials(name: string): string {
	return name
		.split(' ')
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();
}

type UserColumnsOptions = {
	onBan: (user: UserRow) => void;
	onUnban: (user: UserRow) => void;
	onSetRole: (user: UserRow) => void;
};

export function getUserColumns({
	onBan,
	onUnban,
	onSetRole,
}: UserColumnsOptions): ColumnDef<UserRow>[] {
	return [
		{
			accessorKey: 'name',
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 h-8 font-medium"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					{m.admin_users_column_name()}
					<HugeiconsIcon
						icon={
							column.getIsSorted() === 'asc' ? ArrowUp01Icon : ArrowDown01Icon
						}
						className="size-3.5"
					/>
				</Button>
			),
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex items-center gap-2.5">
						<Avatar className="size-8">
							{user.image && <AvatarImage src={user.image} alt={user.name} />}
							<AvatarFallback className="text-xs">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-foreground">
								{user.name}
							</span>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: 'email',
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 h-8 font-medium"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					{m.admin_users_column_email()}
					<HugeiconsIcon
						icon={
							column.getIsSorted() === 'asc' ? ArrowUp01Icon : ArrowDown01Icon
						}
						className="size-3.5"
					/>
				</Button>
			),
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.getValue('email')}
				</span>
			),
		},
		{
			accessorKey: 'role',
			header: () => (
				<span className="font-medium">{m.admin_users_column_role()}</span>
			),
			cell: ({ row }) => {
				const role = row.getValue('role') as UserRole;
				return (
					<Badge variant={ROLE_VARIANTS[role]}>{ROLE_LABELS[role]()}</Badge>
				);
			},
		},
		{
			accessorKey: 'banned',
			header: () => (
				<span className="font-medium">{m.admin_users_column_status()}</span>
			),
			cell: ({ row }) => {
				const banned = row.original.banned;
				return banned ? (
					<Badge variant="destructive">{m.admin_users_status_banned()}</Badge>
				) : (
					<Badge variant="outline">{m.admin_users_status_active()}</Badge>
				);
			},
		},
		{
			accessorKey: 'createdAt',
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 h-8 font-medium"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					{m.admin_users_column_created()}
					<HugeiconsIcon
						icon={
							column.getIsSorted() === 'asc' ? ArrowUp01Icon : ArrowDown01Icon
						}
						className="size-3.5"
					/>
				</Button>
			),
			cell: ({ row }) => {
				const date = row.getValue('createdAt') as Date;
				return (
					<span className="text-sm text-muted-foreground">
						{new Date(date).toLocaleDateString()}
					</span>
				);
			},
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => {
				const user = row.original;
				const isProtected = isAdminPlatformProtectedUserRole(user.role);

				return (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="ghost" size="icon-xs" />}
						>
							<span className="sr-only">{m.admin_users_open_menu()}</span>
							<HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuGroup>
								<DropdownMenuLabel>
									{m.admin_users_column_actions()}
								</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => navigator.clipboard.writeText(user.id)}
								>
									<HugeiconsIcon icon={UserIcon} className="size-4" />
									{m.admin_users_copy_id()}
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								{isProtected ? (
									<DropdownMenuItem disabled>
										<HugeiconsIcon icon={ShieldKeyIcon} className="size-4" />
										{m.admin_users_actions_restricted()}
									</DropdownMenuItem>
								) : (
									<>
										<DropdownMenuItem onClick={() => onSetRole(user)}>
											<HugeiconsIcon icon={ShieldKeyIcon} className="size-4" />
											{m.admin_users_set_role_action()}
										</DropdownMenuItem>
										{user.banned ? (
											<DropdownMenuItem onClick={() => onUnban(user)}>
												<HugeiconsIcon
													icon={SecurityCheckIcon}
													className="size-4"
												/>
												{m.admin_users_unban_action()}
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem
												variant="destructive"
												onClick={() => onBan(user)}
											>
												<HugeiconsIcon icon={Cancel01Icon} className="size-4" />
												{m.admin_users_ban_action()}
											</DropdownMenuItem>
										)}
									</>
								)}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];
}
