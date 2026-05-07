import {
	FavouriteIcon,
	Location01Icon,
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
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@mallhub/ui';
import { Link } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import type { ReservationStatus } from '@/features/.server/prisma/generated/enums';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { resolveLocaleFromRequest } from '@/features/.server/trpc/locale.context';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { buildCustomerReservationDetailPath } from '@/features/reservations/lib/reservation-flow.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/customer-dashboard.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.customer_dashboard_meta_title() },
	{ name: 'description', content: m.customer_dashboard_meta_description() },
];

type ReservationsTab = 'active' | 'completed' | 'canceled';

const ACTIVE_STATUSES = new Set<ReservationStatus>(['PENDING', 'CONFIRMED']);
const COMPLETED_STATUSES = new Set<ReservationStatus>(['COMPLETED']);
const CANCELED_STATUSES = new Set<ReservationStatus>(['CANCELED', 'REJECTED']);

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0])
		.join('')
		.toUpperCase();
}

function formatRequestedAt(value: string): string {
	const date = new Date(value);

	return new Intl.DateTimeFormat(undefined, {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

export const loader = async ({ request }: Route.LoaderArgs) => {
	const session = await requireAuthenticatedSession(request);
	const locale = resolveLocaleFromRequest(request);
	const url = new URL(request.url);
	const rawReservationsTab = url.searchParams.get('reservationsTab');
	const reservationsTab: ReservationsTab =
		rawReservationsTab === 'completed' || rawReservationsTab === 'canceled'
			? rawReservationsTab
			: 'active';

	const reservations = await prisma.reservation.findMany({
		where: {
			customerUserId: session.user.id,
		},
		orderBy: {
			requestedAt: 'desc',
		},
		select: {
			id: true,
			productId: true,
			status: true,
			statusReason: true,
			quantity: true,
			requestedAt: true,
			store: {
				select: {
					name: true,
					floor: true,
				},
			},
			product: {
				select: {
					name: true,
				},
			},
		},
	});

	return {
		reservations: reservations.map((reservation) => ({
			id: reservation.id,
			productId: reservation.productId,
			status: reservation.status,
			statusReason: reservation.statusReason,
			quantity: reservation.quantity,
			requestedAt: reservation.requestedAt.toISOString(),
			storeName: reservation.store.name,
			storeFloor: reservation.store.floor,
			productName: reservation.product.name,
			detailHref: localizeHref(
				buildCustomerReservationDetailPath(reservation.id),
				{
					locale,
				},
			),
		})),
		defaultReservationsTab: reservationsTab,
	};
};

const RESERVATION_STATUS_BADGE: Record<
	ReservationStatus,
	{ variant: 'default' | 'secondary' | 'outline'; label: () => string }
> = {
	PENDING: {
		variant: 'secondary',
		label: () => m.customer_dashboard_reservation_status_pending(),
	},
	CONFIRMED: {
		variant: 'default',
		label: () => m.customer_dashboard_reservation_status_confirmed(),
	},
	COMPLETED: {
		variant: 'outline',
		label: () => m.customer_dashboard_reservation_status_completed(),
	},
	CANCELED: {
		variant: 'outline',
		label: () => m.customer_dashboard_reservation_status_canceled(),
	},
	REJECTED: {
		variant: 'outline',
		label: () => m.customer_dashboard_reservation_status_canceled(),
	},
};

function ReservationCard({
	reservation,
}: {
	reservation: {
		id: string;
		productId: string;
		status: ReservationStatus;
		quantity: number;
		requestedAt: string;
		statusReason: string | null;
		storeName: string;
		storeFloor: string | null;
		productName: string;
		detailHref: string;
	};
}) {
	const statusInfo = RESERVATION_STATUS_BADGE[reservation.status];
	const isActiveReservation = ACTIVE_STATUSES.has(reservation.status);
	const isCanceledReservation = CANCELED_STATUSES.has(reservation.status);
	const detailButtonLabel = isActiveReservation
		? m.customer_dashboard_reservation_view_qr()
		: m.admin_campaigns_action_view_detail();
	const reasonText =
		reservation.statusReason?.trim() ||
		m.reservation_flow_step_three_floor_empty();

	const cardContent = (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
							<HugeiconsIcon
								icon={ShoppingCart01Icon}
								className="size-5 text-muted-foreground"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-sm font-medium text-foreground">
								{reservation.productName}
							</span>
							<span className="text-xs text-muted-foreground">
								{reservation.storeName}
							</span>
						</div>
					</div>
					<Badge variant={statusInfo.variant}>{statusInfo.label()}</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="grid gap-1 text-xs text-muted-foreground">
					<span>
						{m.customer_dashboard_reservation_requested_at({
							date: formatRequestedAt(reservation.requestedAt),
						})}
					</span>
					<span>
						{m.customer_dashboard_reservation_quantity({
							quantity: reservation.quantity,
						})}
					</span>
					{reservation.storeFloor && (
						<span className="flex items-center gap-1">
							<HugeiconsIcon icon={Location01Icon} className="size-3.5" />
							{m.customer_dashboard_reservation_floor({
								floor: reservation.storeFloor,
							})}
						</span>
					)}
					{isCanceledReservation && (
						<span>
							{m.admin_billing_notification_reason_line({
								reason: reasonText,
							})}
						</span>
					)}
				</div>
				{!isActiveReservation && (
					<Button
						variant="outline"
						size="xs"
						nativeButton={false}
						render={<Link to={reservation.detailHref} />}
					>
						<HugeiconsIcon icon={QrCode01Icon} data-icon="inline-start" />
						{detailButtonLabel}
					</Button>
				)}
			</CardContent>
		</Card>
	);

	if (isActiveReservation) {
		return (
			<Link
				to={reservation.detailHref}
				className="block rounded-xl transition-opacity hover:opacity-95"
			>
				{cardContent}
			</Link>
		);
	}

	return cardContent;
}

function ReservationsEmptyState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<div className="flex size-14 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon
					icon={QrCode01Icon}
					className="size-7 text-muted-foreground"
				/>
			</div>
			<div className="space-y-1">
				<p className="text-sm font-medium text-foreground">{title}</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				nativeButton={false}
				render={<Link to={localizeHref('/stores')} />}
			>
				{m.nav_stores()}
			</Button>
		</div>
	);
}

export default function CustomerDashboardRoute({
	loaderData,
}: Route.ComponentProps) {
	const session = useAppSession();
	const user = session.data?.user;
	const activeReservations = loaderData.reservations.filter((reservation) =>
		ACTIVE_STATUSES.has(reservation.status),
	);
	const completedReservations = loaderData.reservations.filter((reservation) =>
		COMPLETED_STATUSES.has(reservation.status),
	);
	const canceledReservations = loaderData.reservations.filter((reservation) =>
		CANCELED_STATUSES.has(reservation.status),
	);

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
					<Tabs
						defaultValue={loaderData.defaultReservationsTab as ReservationsTab}
					>
						<TabsList className="mb-4">
							<TabsTrigger value="active">
								{m.customer_dashboard_reservations_active_tab()}
							</TabsTrigger>
							<TabsTrigger value="completed">
								{m.customer_dashboard_reservation_status_completed()}
							</TabsTrigger>
							<TabsTrigger value="canceled">
								{m.customer_dashboard_reservation_status_canceled()}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="active">
							{activeReservations.length === 0 ? (
								<ReservationsEmptyState
									title={m.customer_dashboard_reservations_active_empty_title()}
									description={m.customer_dashboard_reservations_active_empty_description()}
								/>
							) : (
								<div className="flex flex-col gap-4">
									{activeReservations.map((reservation) => (
										<ReservationCard
											key={reservation.id}
											reservation={reservation}
										/>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="completed">
							{completedReservations.length === 0 ? (
								<ReservationsEmptyState
									title={m.customer_dashboard_reservations_history_empty_title()}
									description={m.customer_dashboard_reservations_history_empty_description()}
								/>
							) : (
								<div className="flex flex-col gap-4">
									{completedReservations.map((reservation) => (
										<ReservationCard
											key={reservation.id}
											reservation={reservation}
										/>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="canceled">
							{canceledReservations.length === 0 ? (
								<ReservationsEmptyState
									title={m.customer_dashboard_reservations_history_empty_title()}
									description={m.customer_dashboard_reservations_history_empty_description()}
								/>
							) : (
								<div className="flex flex-col gap-4">
									{canceledReservations.map((reservation) => (
										<ReservationCard
											key={reservation.id}
											reservation={reservation}
										/>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
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
							nativeButton={false}
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
