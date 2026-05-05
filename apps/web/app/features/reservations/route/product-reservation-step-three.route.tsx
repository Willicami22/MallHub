import { toast } from '@mallhub/ui';
import { useCallback } from 'react';
import { Link } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { resolveLocaleFromRequest } from '@/features/.server/trpc/locale.context';
import {
	extractSelectedVariantsFromPickupNote,
	isStoreOpenNow,
	parseOpenHoursRange,
} from '@/features/reservations/lib/reservation-flow.lib';
import { ReservationStepThreeSummaryOrganism } from '@/features/reservations/organisms/reservation-step-three-summary.organism';
import { ReservationStepTemplate } from '@/features/reservations/templates/reservation-step.template';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/product-reservation-step-three.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.reservation_flow_step_three_meta_title() },
];

function createIcsDateValue(date: Date): string {
	const toTwoDigits = (value: number) => String(value).padStart(2, '0');

	return `${date.getUTCFullYear()}${toTwoDigits(date.getUTCMonth() + 1)}${toTwoDigits(date.getUTCDate())}T${toTwoDigits(date.getUTCHours())}${toTwoDigits(date.getUTCMinutes())}${toTwoDigits(date.getUTCSeconds())}Z`;
}

function createIcsReservationEvent({
	title,
	description,
	location,
	startAt,
	endAt,
}: {
	title: string;
	description: string;
	location: string;
	startAt: Date;
	endAt: Date;
}): string {
	const eventId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${Date.now()}@mallhub`;

	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//MallHub//Reservation//EN',
		'BEGIN:VEVENT',
		`UID:${eventId}`,
		`DTSTAMP:${createIcsDateValue(new Date())}`,
		`DTSTART:${createIcsDateValue(startAt)}`,
		`DTEND:${createIcsDateValue(endAt)}`,
		`SUMMARY:${title}`,
		`DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
		`LOCATION:${location}`,
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n');
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const session = await requireAuthenticatedSession(request);
	const locale = resolveLocaleFromRequest(request);

	if (!params.productId || !params.reservationId) {
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
			productId: params.productId,
			customerUserId: session.user.id,
		},
		select: {
			id: true,
			qrCodeValue: true,
			quantity: true,
			pickupNote: true,
			store: {
				select: {
					name: true,
					floor: true,
					openHours: true,
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

	return {
		reservation: {
			...reservation,
			selectedVariants: extractSelectedVariantsFromPickupNote(
				reservation.pickupNote,
			),
		},
		dashboardHref: localizeHref('/dashboard?reservationsTab=active', {
			locale,
		}),
		homeHref: localizeHref('/', { locale }),
	};
};

export default function ProductReservationStepThreeRoute({
	loaderData,
}: Route.ComponentProps) {
	const reservation = loaderData.reservation;

	const handleAddToCalendar = useCallback(async () => {
		if (!reservation) {
			return;
		}

		const openHoursRange = parseOpenHoursRange(reservation.store.openHours);
		const now = new Date();
		const startAt = new Date(now);

		if (openHoursRange) {
			if (isStoreOpenNow(reservation.store.openHours, now)) {
				startAt.setHours(
					Math.floor(openHoursRange.opensAtMinutes / 60),
					openHoursRange.opensAtMinutes % 60,
					0,
					0,
				);
			} else {
				startAt.setDate(startAt.getDate() + 1);
				startAt.setHours(
					Math.floor(openHoursRange.opensAtMinutes / 60),
					openHoursRange.opensAtMinutes % 60,
					0,
					0,
				);
			}
		} else {
			startAt.setDate(startAt.getDate() + 1);
			startAt.setHours(10, 0, 0, 0);
		}

		const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
		const calendarApi = (
			navigator as Navigator & {
				calendar?: {
					createEvent: (event: {
						title: string;
						description: string;
						location: string;
						start: Date;
						end: Date;
					}) => Promise<void>;
				};
			}
		).calendar;

		try {
			if (calendarApi?.createEvent) {
				await calendarApi.createEvent({
					title: m.reservation_flow_calendar_event_title(),
					description: m.reservation_flow_calendar_event_description({
						reservationCode: reservation.qrCodeValue,
					}),
					location: reservation.store.name,
					start: startAt,
					end: endAt,
				});
				toast.success(m.reservation_flow_calendar_success_toast());
				return;
			}

			const fileContent = createIcsReservationEvent({
				title: m.reservation_flow_calendar_event_title(),
				description: m.reservation_flow_calendar_event_description({
					reservationCode: reservation.qrCodeValue,
				}),
				location: reservation.store.name,
				startAt,
				endAt,
			});

			const fileBlob = new Blob([fileContent], {
				type: 'text/calendar;charset=utf-8',
			});
			const fileUrl = URL.createObjectURL(fileBlob);
			const link = document.createElement('a');
			link.href = fileUrl;
			link.download = `mallhub-reservation-${reservation.id}.ics`;
			document.body.append(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(fileUrl);

			toast.success(m.reservation_flow_calendar_download_toast());
		} catch {
			toast.error(m.reservation_flow_calendar_error_toast());
		}
	}, [reservation]);

	if (!reservation) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
				<div className="rounded-xl border p-6 text-center">
					<h1 className="text-lg font-semibold text-foreground">
						{m.reservation_flow_reservation_not_found_title()}
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{m.reservation_flow_reservation_not_found_description()}
					</p>
					<div className="mt-4">
						<Link
							to={loaderData.dashboardHref ?? localizeHref('/dashboard')}
							className="text-sm font-medium text-primary underline underline-offset-4"
						>
							{m.reservation_flow_step_three_view_reservations()}
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const variantsLabel =
		reservation.selectedVariants.length > 0
			? reservation.selectedVariants
					.map(
						(selectedVariant) =>
							`${selectedVariant.type}: ${selectedVariant.option}`,
					)
					.join(', ')
			: m.reservation_flow_step_three_variant_none();
	const estimatedPickup = isStoreOpenNow(reservation.store.openHours)
		? m.reservation_flow_step_three_estimated_today({
				hours:
					reservation.store.openHours ??
					m.reservation_flow_step_three_estimated_no_hours(),
			})
		: m.reservation_flow_step_three_estimated_next_business_day({
				hours:
					reservation.store.openHours ??
					m.reservation_flow_step_three_estimated_no_hours(),
			});

	return (
		<ReservationStepTemplate
			title={m.reservation_flow_step_three_title()}
			description={m.reservation_flow_step_three_description()}
			currentStep={3}
			stepOneLabel={m.reservation_flow_stepper_step_one()}
			stepTwoLabel={m.reservation_flow_stepper_step_two()}
			stepThreeLabel={m.reservation_flow_stepper_step_three()}
		>
			<ReservationStepThreeSummaryOrganism
				successTitle={m.reservation_flow_step_three_success_title()}
				successDescription={m.reservation_flow_step_three_success_description()}
				summaryTitle={m.reservation_flow_step_three_summary_title()}
				qrTitle={m.reservation_flow_step_three_qr_title()}
				qrValue={reservation.qrCodeValue}
				storeLabel={m.reservation_flow_step_three_store_label()}
				floorLabel={m.reservation_flow_step_three_floor_label()}
				productLabel={m.reservation_flow_step_three_product_label()}
				variantLabel={m.reservation_flow_step_three_variant_label()}
				quantityLabel={m.reservation_flow_step_three_quantity_label()}
				estimatedPickupLabel={m.reservation_flow_step_three_estimated_label()}
				storeValue={reservation.store.name}
				floorValue={
					reservation.store.floor ?? m.reservation_flow_step_three_floor_empty()
				}
				productValue={reservation.product.name}
				variantValue={variantsLabel}
				quantityValue={String(reservation.quantity)}
				estimatedPickupValue={estimatedPickup}
				viewReservationsLabel={m.reservation_flow_step_three_view_reservations()}
				continueExploringLabel={m.reservation_flow_step_three_continue_exploring()}
				addToCalendarLabel={m.reservation_flow_step_three_add_to_calendar()}
				viewReservationsHref={
					loaderData.dashboardHref ??
					localizeHref('/dashboard?reservationsTab=active')
				}
				continueExploringHref={loaderData.homeHref ?? localizeHref('/')}
				onAddToCalendar={handleAddToCalendar}
			/>
		</ReservationStepTemplate>
	);
}
