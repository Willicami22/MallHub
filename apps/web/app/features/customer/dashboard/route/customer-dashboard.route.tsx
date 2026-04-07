import {
	FavouriteIcon,
	QrCode01Icon,
	Settings01Icon,
	ShoppingCart01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Separator,
	Skeleton,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@mallhub/ui';
import { Link } from 'react-router';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/customer-dashboard.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.customer_dashboard_meta_title() },
	{ name: 'description', content: m.customer_dashboard_meta_description() },
];

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0])
		.join('')
		.toUpperCase();
}

// TODO-MOCK: Replace with real data
const PLACEHOLDER_RESERVATIONS = [
	{ id: 'r1', status: 'confirmed' as const },
	{ id: 'r2', status: 'pending' as const },
	{ id: 'r3', status: 'completed' as const },
] as const;

const STATUS_BADGE: Record<
	'confirmed' | 'pending' | 'completed',
	{ label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
	confirmed: { label: 'Confirmada', variant: 'default' },
	pending: { label: 'Pendiente', variant: 'secondary' },
	completed: { label: 'Completada', variant: 'outline' },
};

export default function CustomerDashboardRoute() {
	const session = useAppSession();
	const user = session.data?.user;

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-6">
				<div className="flex items-center gap-4">
					<Avatar size="lg">
						<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
						<AvatarFallback>
							{getInitials(user?.name ?? user?.email ?? 'U')}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.customer_dashboard_title()}
						</h1>
						<p className="text-sm text-muted-foreground">{user?.email}</p>
					</div>
				</div>
			</div>

			<Tabs defaultValue="reservations">
				<TabsList className="mb-6">
					<TabsTrigger value="reservations">
						<HugeiconsIcon icon={QrCode01Icon} className="size-3.5" />
						{m.customer_dashboard_reservations()}
					</TabsTrigger>
					<TabsTrigger value="profile">
						<HugeiconsIcon icon={UserIcon} className="size-3.5" />
						{m.customer_dashboard_profile()}
					</TabsTrigger>
					<TabsTrigger value="favorites">
						<HugeiconsIcon icon={FavouriteIcon} className="size-3.5" />
						{m.customer_dashboard_favorites()}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="reservations">
					<div className="flex flex-col gap-4">
						{PLACEHOLDER_RESERVATIONS.map((reservation) => {
							const statusInfo = STATUS_BADGE[reservation.status];
							return (
								<Card key={reservation.id}>
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-3">
												<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
													<HugeiconsIcon
														icon={ShoppingCart01Icon}
														className="size-5 text-muted-foreground"
													/>
												</div>
												<div className="flex flex-col gap-1.5">
													<Skeleton className="h-4 w-44" />
													<Skeleton className="h-3.5 w-28" />
												</div>
											</div>
											<Badge variant={statusInfo.variant}>
												{statusInfo.label}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pb-3">
										<div className="flex items-center justify-between">
											<Skeleton className="h-3.5 w-32" />
											{reservation.status === 'confirmed' && (
												<Button variant="outline" size="xs">
													<HugeiconsIcon
														icon={QrCode01Icon}
														data-icon="inline-start"
													/>
													Ver QR
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								{m.customer_dashboard_profile()}
							</CardTitle>
							<CardDescription className="text-sm text-muted-foreground">
								Información de tu cuenta
							</CardDescription>
						</CardHeader>
						<Separator />
						<CardContent className="pt-4">
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-0.5">
										<span className="text-xs text-muted-foreground">
											Nombre
										</span>
										<span className="text-sm font-medium text-foreground">
											{user?.name ?? '—'}
										</span>
									</div>
									<Button variant="ghost" size="icon-sm">
										<HugeiconsIcon icon={Settings01Icon} className="size-4" />
									</Button>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-0.5">
										<span className="text-xs text-muted-foreground">Email</span>
										<span className="text-sm font-medium text-foreground">
											{user?.email ?? '—'}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="favorites">
					<div className="flex flex-col items-center gap-3 py-16 text-center">
						<div className="flex size-14 items-center justify-center rounded-full bg-muted">
							<HugeiconsIcon
								icon={FavouriteIcon}
								className="size-7 text-muted-foreground"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium text-foreground">
								{m.customer_dashboard_favorites()}
							</p>
							<p className="text-sm text-muted-foreground">
								Aquí aparecerán tus tiendas y productos favoritos
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							render={<Link to={localizeHref('/stores')} />}
						>
							{m.nav_stores()}
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
