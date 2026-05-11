import {
	Building04Icon,
	DashboardSquare01Icon,
	Home01Icon,
	Logout01Icon,
	Menu01Icon,
	MoonIcon,
	Notification01Icon,
	Search01Icon,
	Settings01Icon,
	ShoppingBag01Icon,
	ShoppingCart01Icon,
	Store02Icon,
	SunIcon,
	UserGroupIcon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Separator,
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	toast,
} from '@mallhub/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { signOut } from '@/features/better-auth/better-auth-client.lib';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import { BrandLogo } from './brand-mark';

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0])
		.join('')
		.toUpperCase();
}

function canAccessAdminPlatform(user: { role?: string | null }): boolean {
	return user.role === appRoles.ADMIN_PLATFORM;
}

function canAccessAdminCc(user: { role?: string | null }): boolean {
	return user.role === appRoles.ADMIN_CC;
}

function canAccessAdminLocal(user: { role?: string | null }): boolean {
	return user.role === appRoles.ADMIN_LOCAL;
}

const NAV_LINKS = [
	{
		href: '/',
		label: () => m.nav_home(),
		icon: Home01Icon,
		exact: true,
	},
	{
		href: '/malls',
		label: () => m.nav_malls(),
		icon: Building04Icon,
		exact: false,
	},
	{
		href: '/stores',
		label: () => m.nav_stores(),
		icon: ShoppingBag01Icon,
		exact: false,
	},
	{
		href: '/search',
		label: () => m.nav_search(),
		icon: Search01Icon,
		exact: false,
	},
] as const;

function ThemeToggleButton() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						aria-label={m.nav_toggle_theme()}
						onClick={() =>
							setTheme((resolvedTheme ?? 'light') === 'dark' ? 'light' : 'dark')
						}
					/>
				}
			>
				<HugeiconsIcon icon={SunIcon} className="hidden size-4 dark:block" />
				<HugeiconsIcon icon={MoonIcon} className="size-4 dark:hidden" />
			</TooltipTrigger>
			<TooltipContent side="bottom">{m.nav_toggle_theme()}</TooltipContent>
		</Tooltip>
	);
}

function NavLink({
	href,
	label,
	icon: Icon,
	exact,
	onClick,
}: {
	href: string;
	label: () => string;
	icon: typeof Home01Icon;
	exact: boolean;
	onClick?: () => void;
}) {
	const location = useLocation();
	const localizedHref = localizeHref(href);
	const isActive = exact
		? location.pathname === localizedHref ||
			location.pathname === localizedHref.replace(/\/$/, '')
		: location.pathname.startsWith(localizedHref);

	return (
		<Button
			variant="ghost"
			size="sm"
			className={cn(
				'justify-start gap-2',
				isActive && 'bg-accent text-accent-foreground font-medium',
			)}
			nativeButton={false}
			render={<Link to={localizedHref} onClick={onClick} />}
		>
			<HugeiconsIcon icon={Icon} className="size-4" />
			{label()}
		</Button>
	);
}

function AdminPlatformSignOutDialog({
	open,
	onOpenChange,
	isSubmitting,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSubmitting: boolean;
	onConfirm: () => Promise<void>;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{m.nav_admin_sign_out_title()}</DialogTitle>
					<DialogDescription>
						{m.nav_admin_sign_out_description()}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						{m.nav_cancel()}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={() => {
							void onConfirm();
						}}
						disabled={isSubmitting}
					>
						{isSubmitting
							? m.nav_signing_out()
							: m.nav_admin_sign_out_confirm()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function UserMenu() {
	const session = useAppSession();
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const returnTo = `${location.pathname}${location.search}${location.hash}`;
	const signInHref = withReturnTo(localizeHref('/auth/login'), returnTo);
	const signUpHref = withReturnTo(localizeHref('/auth/register'), returnTo);

	if (!session.data) {
		return (
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					nativeButton={false}
					render={<Link to={signInHref} />}
				>
					{m.nav_sign_in()}
				</Button>
				<Button
					size="sm"
					nativeButton={false}
					render={<Link to={signUpHref} />}
				>
					{m.nav_sign_up()}
				</Button>
			</div>
		);
	}

	const user = session.data.user;
	const initials = getInitials(user.name ?? user.email ?? '');
	const isAdminPlatformUser = user.role === appRoles.ADMIN_PLATFORM;

	const performSignOut = async () => {
		setIsSigningOut(true);

		try {
			await signOut();
			queryClient.clear();
			navigate(localizeHref('/'));
		} catch (error) {
			console.error('[navbar.user-menu.sign-out] Error', { error });
			toast.error(m.auth_unexpected_error());
		} finally {
			setIsSigningOut(false);
			setIsSignOutDialogOpen(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							aria-label={m.nav_user_menu()}
							className="rounded-full"
						/>
					}
				>
					<Avatar>
						<AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuGroup>
						<DropdownMenuLabel>
							<div className="flex flex-col gap-0.5">
								<span className="text-sm font-medium text-foreground">
									{user.name}
								</span>
								<span className="text-xs text-muted-foreground truncate">
									{user.email}
								</span>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigate(localizeHref('/dashboard'))}
						>
							<HugeiconsIcon icon={UserIcon} className="size-4" />
							{m.nav_my_profile()}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => navigate(localizeHref('/dashboard'))}
						>
							<HugeiconsIcon icon={ShoppingCart01Icon} className="size-4" />
							{m.nav_my_reservations()}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => navigate(localizeHref('/dashboard'))}
						>
							<HugeiconsIcon icon={Settings01Icon} className="size-4" />
							{m.nav_settings()}
						</DropdownMenuItem>
					</DropdownMenuGroup>
					{canAccessAdminPlatform(user) && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={() => navigate(localizeHref('/admin/dashboard'))}
								>
									<HugeiconsIcon
										icon={DashboardSquare01Icon}
										className="size-4"
									/>
									{m.nav_admin_platform()}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => navigate(localizeHref('/admin/users'))}
								>
									<HugeiconsIcon icon={UserGroupIcon} className="size-4" />
									{m.admin_users_title()}
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</>
					)}
					{canAccessAdminCc(user) && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={() => navigate(localizeHref('/admin-cc/dashboard'))}
								>
									<HugeiconsIcon icon={Building04Icon} className="size-4" />
									{m.nav_admin_cc()}
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</>
					)}
					{canAccessAdminLocal(user) && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={() =>
										navigate(localizeHref('/store-local/dashboard'))
									}
								>
									<HugeiconsIcon icon={Store02Icon} className="size-4" />
									{m.nav_admin_local()}
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem
							variant="destructive"
							onClick={async () => {
								if (isAdminPlatformUser) {
									setIsSignOutDialogOpen(true);
									return;
								}

								await performSignOut();
							}}
						>
							<HugeiconsIcon icon={Logout01Icon} className="size-4" />
							{m.nav_sign_out()}
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			{isAdminPlatformUser && (
				<AdminPlatformSignOutDialog
					open={isSignOutDialogOpen}
					onOpenChange={setIsSignOutDialogOpen}
					isSubmitting={isSigningOut}
					onConfirm={performSignOut}
				/>
			)}
		</>
	);
}

function MobileMenuSheet() {
	const session = useAppSession();
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const returnTo = `${location.pathname}${location.search}${location.hash}`;
	const signInHref = withReturnTo(localizeHref('/auth/login'), returnTo);
	const signUpHref = withReturnTo(localizeHref('/auth/register'), returnTo);
	const isAdminPlatformUser =
		session.data?.user.role === appRoles.ADMIN_PLATFORM;

	const performSignOut = async () => {
		setIsSigningOut(true);

		try {
			await signOut();
			queryClient.clear();
			navigate(localizeHref('/'));
		} catch (error) {
			console.error('[navbar.mobile-menu.sign-out] Error', { error });
			toast.error(m.auth_unexpected_error());
		} finally {
			setIsSigningOut(false);
			setIsSignOutDialogOpen(false);
		}
	};

	return (
		<>
			<Sheet>
				<SheetTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							aria-label={m.nav_toggle_menu()}
							className="lg:hidden"
						/>
					}
				>
					<HugeiconsIcon icon={Menu01Icon} className="size-5" />
				</SheetTrigger>
				<SheetContent side="left" className="w-72 p-0">
					<SheetTitle className="sr-only">Navigation</SheetTitle>
					<div className="flex items-center gap-3 border-b px-5 py-4">
						<BrandLogo />
					</div>
					<nav className="flex flex-col gap-1 p-4">
						{NAV_LINKS.map((link) => (
							<NavLink key={link.href} {...link} />
						))}
					</nav>

					<Separator />
					{session.data ? (
						<div className="flex flex-col gap-1 p-4">
							<div className="mb-2 flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
								<Avatar size="sm">
									<AvatarImage
										src={session.data.user.image ?? ''}
										alt={session.data.user.name ?? ''}
									/>
									<AvatarFallback>
										{getInitials(
											session.data.user.name ?? session.data.user.email ?? '',
										)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-0.5 overflow-hidden">
									<span className="truncate text-sm font-medium text-foreground">
										{session.data.user.name}
									</span>
									<span className="truncate text-xs text-muted-foreground">
										{session.data.user.email}
									</span>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="justify-start gap-2"
								onClick={() => navigate(localizeHref('/dashboard'))}
							>
								<HugeiconsIcon icon={UserIcon} className="size-4" />
								{m.nav_my_profile()}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="justify-start gap-2"
								onClick={() => navigate(localizeHref('/dashboard'))}
							>
								<HugeiconsIcon icon={ShoppingCart01Icon} className="size-4" />
								{m.nav_my_reservations()}
							</Button>
							{canAccessAdminPlatform(session.data.user) && (
								<>
									<Button
										variant="ghost"
										size="sm"
										className="justify-start gap-2"
										onClick={() => navigate(localizeHref('/admin/dashboard'))}
									>
										<HugeiconsIcon
											icon={DashboardSquare01Icon}
											className="size-4"
										/>
										{m.nav_admin_platform()}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="justify-start gap-2"
										onClick={() => navigate(localizeHref('/admin/users'))}
									>
										<HugeiconsIcon icon={UserGroupIcon} className="size-4" />
										{m.admin_users_title()}
									</Button>
								</>
							)}
							{canAccessAdminCc(session.data.user) && (
								<Button
									variant="ghost"
									size="sm"
									className="justify-start gap-2"
									onClick={() => navigate(localizeHref('/admin-cc/dashboard'))}
								>
									<HugeiconsIcon icon={Building04Icon} className="size-4" />
									{m.nav_admin_cc()}
								</Button>
							)}
							{canAccessAdminLocal(session.data.user) && (
								<Button
									variant="ghost"
									size="sm"
									className="justify-start gap-2"
									onClick={() =>
										navigate(localizeHref('/store-local/dashboard'))
									}
								>
									<HugeiconsIcon icon={Store02Icon} className="size-4" />
									{m.nav_admin_local()}
								</Button>
							)}
							<Separator className="my-1" />
							<Button
								variant="ghost"
								size="sm"
								className="justify-start gap-2 text-destructive hover:text-destructive"
								onClick={async () => {
									if (isAdminPlatformUser) {
										setIsSignOutDialogOpen(true);
										return;
									}

									await performSignOut();
								}}
							>
								<HugeiconsIcon icon={Logout01Icon} className="size-4" />
								{m.nav_sign_out()}
							</Button>
						</div>
					) : (
						<div className="flex flex-col gap-2 p-4">
							<Button nativeButton={false} render={<Link to={signInHref} />}>
								{m.nav_sign_in()}
							</Button>
							<Button
								variant="outline"
								nativeButton={false}
								render={<Link to={signUpHref} />}
							>
								{m.nav_sign_up()}
							</Button>
						</div>
					)}
				</SheetContent>
			</Sheet>
			{isAdminPlatformUser && (
				<AdminPlatformSignOutDialog
					open={isSignOutDialogOpen}
					onOpenChange={setIsSignOutDialogOpen}
					isSubmitting={isSigningOut}
					onConfirm={performSignOut}
				/>
			)}
		</>
	);
}

export function Navbar() {
	const session = useAppSession();

	return (
		<TooltipProvider delay={400}>
			<header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
					<div className="flex items-center gap-6">
						<Link
							to={localizeHref('/')}
							className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
						>
							<BrandLogo />
						</Link>
						<nav className="hidden items-center gap-0.5 lg:flex">
							{NAV_LINKS.map((link) => (
								<NavLink key={link.href} {...link} />
							))}
						</nav>
					</div>
					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										variant="ghost"
										size="icon"
										aria-label={m.nav_open_search()}
										nativeButton={false}
										render={<Link to={localizeHref('/search')} />}
									/>
								}
							>
								<HugeiconsIcon icon={Search01Icon} className="size-4" />
							</TooltipTrigger>
							<TooltipContent side="bottom">{m.nav_search()}</TooltipContent>
						</Tooltip>
						{session.data && (
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="ghost"
											size="icon"
											className="relative"
											aria-label={m.nav_notifications()}
										/>
									}
								>
									<HugeiconsIcon icon={Notification01Icon} className="size-4" />
									<span
										className="pointer-events-none absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
										aria-hidden="true"
									/>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{m.nav_notifications()}
								</TooltipContent>
							</Tooltip>
						)}
						<ThemeToggleButton />
						<Separator orientation="vertical" className="mx-1 h-5" />
						<UserMenu />
						<MobileMenuSheet />
					</div>
				</div>
			</header>
		</TooltipProvider>
	);
}
