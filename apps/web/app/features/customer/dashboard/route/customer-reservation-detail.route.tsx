import { createHash } from 'node:crypto';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import { useState } from 'react';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import { dispatchNotificationEmail } from '@/features/.server/notifications/notification-email-dispatcher.lib';
import type { ReservationStatus } from '@/features/.server/prisma/generated/enums';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { resolveLocaleFromRequest } from '@/features/.server/trpc/locale.context';
import { CustomerReservationCancelDialogMolecule } from '@/features/customer/dashboard/molecules/customer-reservation-cancel-dialog.molecule';
import { CustomerReservationDetailContentOrganism } from '@/features/customer/dashboard/organisms/customer-reservation-detail-content.organism';
import { CustomerReservationDetailTemplate } from '@/features/customer/dashboard/templates/customer-reservation-detail.template';
import { buildCustomerReservationDetailPath } from '@/features/reservations/lib/reservation-flow.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/customer-reservation-detail.route';

const CANCELLABLE_STATUSES = new Set<ReservationStatus>([
	'PENDING',
	'CONFIRMED',
]);
const COMPLETED_STATUSES = new Set<ReservationStatus>(['COMPLETED']);

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

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.customer_dashboard_meta_title() },
];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const session = await requireAuthenticatedSession(request);
	const locale = resolveLocaleFromRequest(request);

	if (!params.reservationId) {
		return {
			reservation: null,
			dashboardHref: localizeHref('/dashboard?reservationsTab=active', {
				locale,
			}),
		};
	}

	const reservation = await prisma.reservation.findFirst({
		where: {
			id: params.reservationId,
			customerUserId: session.user.id,
		},
		select: {
			id: true,
			status: true,
			statusReason: true,
			qrCodeValue: true,
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

	if (!reservation) {
		return {
			reservation: null,
			dashboardHref: localizeHref('/dashboard?reservationsTab=active', {
				locale,
			}),
		};
	}

	const reservationsTab = CANCELLABLE_STATUSES.has(reservation.status)
		? 'active'
		: COMPLETED_STATUSES.has(reservation.status)
			? 'completed'
			: 'canceled';

	return {
		reservation: {
			id: reservation.id,
			status: reservation.status,
			statusReason: reservation.statusReason,
			qrCodeValue: reservation.qrCodeValue,
			quantity: reservation.quantity,
			requestedAt: reservation.requestedAt.toISOString(),
			storeName: reservation.store.name,
			storeFloor: reservation.store.floor,
			productName: reservation.product.name,
		},
		dashboardHref: localizeHref(
			`/dashboard?reservationsTab=${reservationsTab}`,
			{
				locale,
			},
		),
	};
};

export const action = async ({ request, params }: Route.ActionArgs) => {
	const session = await requireAuthenticatedSession(request);
	const locale = resolveLocaleFromRequest(request);

	if (!params.reservationId) {
		return {
			formError: m.reservation_flow_reservation_not_found_description(
				{},
				{ locale },
			),
		};
	}

	const formData = await request.formData();
	const intent = String(formData.get('intent') ?? '');
	if (intent !== 'cancel') {
		return {
			formError: m.reservation_create_error({}, { locale }),
		};
	}

	const reservation = await prisma.reservation.findFirst({
		where: {
			id: params.reservationId,
			customerUserId: session.user.id,
		},
		select: {
			id: true,
			status: true,
			pickupFullName: true,
			pickupPhone: true,
			scheduledAt: true,
			product: {
				select: {
					name: true,
				},
			},
			mall: {
				select: {
					name: true,
				},
			},
			store: {
				select: {
					name: true,
					contactEmail: true,
					owner: {
						select: {
							name: true,
							email: true,
						},
					},
				},
			},
		},
	});

	if (!reservation) {
		return {
			formError: m.reservation_flow_reservation_not_found_description(
				{},
				{ locale },
			),
		};
	}

	if (!CANCELLABLE_STATUSES.has(reservation.status)) {
		return {
			formError: m.reservation_create_error({}, { locale }),
		};
	}

	await prisma.reservation.update({
		where: {
			id: reservation.id,
		},
		data: {
			status: 'CANCELED',
			canceledAt: new Date(),
		},
	});

	const recipients = new Map<string, { email: string; name: string }>();
	const ownerEmail = reservation.store.owner?.email?.trim().toLowerCase();
	if (ownerEmail) {
		recipients.set(ownerEmail, {
			email: ownerEmail,
			name:
				reservation.store.owner?.name?.trim() ||
				m.admin_store_registrations_notification_platform_admin({}, { locale }),
		});
	}

	const contactEmail = reservation.store.contactEmail?.trim().toLowerCase();
	if (contactEmail && !recipients.has(contactEmail)) {
		recipients.set(contactEmail, {
			email: contactEmail,
			name: m.admin_store_registrations_notification_platform_admin(
				{},
				{ locale },
			),
		});
	}

	const pickupDateTime =
		reservation.scheduledAt &&
		new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(reservation.scheduledAt);

	const customerName =
		session.user.name?.trim() || m.admin_users_role_customer({}, { locale });

	for (const recipient of recipients.values()) {
		const digest = createHash('sha256')
			.update(`${reservation.id}:${recipient.email}:customer-cancel`)
			.digest('hex');

		dispatchNotificationEmail({
			to: recipient.email,
			subject: `${m.product_detail_reserve_cancel({}, { locale })} - ${reservation.store.name}`,
			text: [
				m.reservation_flow_step_three_description({}, { locale }),
				`${m.reservation_flow_step_three_store_label({}, { locale })}: ${reservation.store.name}`,
				`${m.search_mall_label({}, { locale })}: ${reservation.mall.name}`,
				`${m.reservation_flow_step_three_product_label({}, { locale })}: ${reservation.product.name}`,
				`${m.admin_users_column_name({}, { locale })}: ${customerName}`,
				`${m.reservation_flow_step_two_pickup_name_label({}, { locale })}: ${reservation.pickupFullName}`,
				`${m.reservation_flow_step_two_pickup_phone_label({}, { locale })}: ${reservation.pickupPhone}`,
				`${m.reservation_flow_step_one_pickup_time_label({}, { locale })}: ${
					pickupDateTime ??
					m.reservation_flow_step_three_estimated_no_hours({}, { locale })
				}`,
			].join('\n'),
			idempotencyKey: `reservation-cancel/${digest}`,
		});
	}

	return redirect(
		localizeHref(buildCustomerReservationDetailPath(reservation.id), {
			locale,
		}),
	);
};

export default function CustomerReservationDetailRoute({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const submit = useSubmit();
	const navigation = useNavigation();
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const reservation = loaderData.reservation;
	const isCancelling =
		navigation.state === 'submitting' &&
		navigation.formData?.get('intent') === 'cancel';
	const canCancel = reservation
		? CANCELLABLE_STATUSES.has(reservation.status)
		: false;
	const showCompletedAction = reservation?.status === 'COMPLETED';

	if (!reservation) {
		return (
			<CustomerReservationDetailTemplate
				title={m.reservation_flow_reservation_not_found_title()}
				description={m.reservation_flow_reservation_not_found_description()}
				backHref={loaderData.dashboardHref}
				backLabel={m.reservation_flow_step_three_view_reservations()}
			>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">
							{m.reservation_flow_reservation_not_found_description()}
						</p>
					</CardContent>
				</Card>
			</CustomerReservationDetailTemplate>
		);
	}

	return (
		<CustomerReservationDetailTemplate
			title={m.customer_dashboard_reservations()}
			description={m.reservation_flow_step_three_description()}
			backHref={loaderData.dashboardHref}
			backLabel={m.reservation_flow_step_three_view_reservations()}
		>
			<div className="space-y-6">
				{actionData?.formError && (
					<Card className="border-destructive/30">
						<CardContent className="pt-6">
							<p className="text-sm text-destructive">{actionData.formError}</p>
						</CardContent>
					</Card>
				)}

				<CustomerReservationDetailContentOrganism
					reservation={reservation}
					qrTitle={m.reservation_flow_step_three_qr_title()}
					storeLabel={m.reservation_flow_step_three_store_label()}
					floorLabel={m.reservation_flow_step_three_floor_label()}
					productLabel={m.reservation_flow_step_three_product_label()}
					quantityLabel={m.reservation_flow_step_three_quantity_label()}
					requestedAtLabel={(value) =>
						m.customer_dashboard_reservation_requested_at({
							date: formatRequestedAt(value),
						})
					}
					cancelReasonLabel={m.customer_dashboard_reservation_status_canceled()}
					emptyReasonLabel={m.reservation_flow_step_three_floor_empty()}
				/>

				{(canCancel || showCompletedAction) && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">
								{m.admin_users_column_actions()}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{canCancel ? (
								<Button
									type="button"
									variant="destructive"
									disabled={isCancelling}
									onClick={() => setCancelDialogOpen(true)}
								>
									{m.product_detail_reserve_cancel()}
								</Button>
							) : (
								<Button type="button" variant="outline" disabled>
									{m.reservation_flow_step_three_continue_exploring()}
								</Button>
							)}
						</CardContent>
					</Card>
				)}
			</div>

			{canCancel && (
				<CustomerReservationCancelDialogMolecule
					open={cancelDialogOpen}
					onOpenChange={(nextOpen) => {
						if (isCancelling) {
							return;
						}

						setCancelDialogOpen(nextOpen);
					}}
					isSubmitting={isCancelling}
					title={m.product_detail_reserve_cancel()}
					description={m.reservation_flow_step_three_description()}
					confirmLabel={m.product_detail_reserve_cancel()}
					confirmingLabel={m.reservation_flow_step_two_submitting()}
					dismissLabel={m.reservation_flow_back_to_stores()}
					onConfirm={() =>
						submit(
							{
								intent: 'cancel',
							},
							{
								method: 'post',
							},
						)
					}
				/>
			)}
		</CustomerReservationDetailTemplate>
	);
}
