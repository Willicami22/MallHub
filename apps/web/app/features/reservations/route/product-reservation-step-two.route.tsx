import { Alert, AlertDescription, Button } from '@mallhub/ui';
import { useState } from 'react';
import { Link, redirect, useNavigation } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import {
	createReservationFromFlow,
	findReservableProduct,
	ReservationCreationError,
} from '@/features/.server/reservations/reservation-flow.server.lib';
import { resolveLocaleFromRequest } from '@/features/.server/trpc/locale.context';
import {
	buildProductReservationStepOnePath,
	buildProductReservationStepThreePath,
	decodeSelectedVariantsParam,
	encodeSelectedVariantsParam,
	isVariantSelectionValid,
	parseQuantityParam,
	parseVariantGroups,
	type SelectedVariant,
	toVariantSelectionMap,
	type VariantGroup,
} from '@/features/reservations/lib/reservation-flow.lib';
import { ReservationProductSummaryOrganism } from '@/features/reservations/organisms/reservation-product-summary.organism';
import { ReservationStepTwoFormOrganism } from '@/features/reservations/organisms/reservation-step-two-form.organism';
import { ReservationStepTemplate } from '@/features/reservations/templates/reservation-step.template';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/product-reservation-step-two.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.reservation_flow_step_two_meta_title() },
];

function buildInitialSelectedVariants({
	groups,
	rawSelectedVariants,
}: {
	groups: VariantGroup[];
	rawSelectedVariants: SelectedVariant[];
}): SelectedVariant[] {
	const requestedMap = toVariantSelectionMap(rawSelectedVariants);

	return groups.map((group) => ({
		type: group.type,
		option: group.options.includes(requestedMap[group.type])
			? requestedMap[group.type]
			: (group.options[0] ?? ''),
	}));
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const session = await requireAuthenticatedSession(request);
	const locale = resolveLocaleFromRequest(request);
	const userPhone = (session.user as { phone?: unknown }).phone;

	if (!params.productId) {
		throw redirect(localizeHref('/stores', { locale }));
	}

	const product = await findReservableProduct(params.productId);
	if (!product) {
		return {
			product: null,
			quantity: 1,
			selectedVariants: [] as SelectedVariant[],
			defaultPickupFullName: session.user.name ?? '',
			defaultPickupPhone: typeof userPhone === 'string' ? userPhone : '',
			backToProductHref: localizeHref('/stores', { locale }),
		};
	}

	const url = new URL(request.url);
	const quantity = parseQuantityParam(
		url.searchParams.get('quantity'),
		product.stock,
	);
	const rawSelectedVariants = decodeSelectedVariantsParam(
		url.searchParams.get('variants'),
	);
	const variantGroups = parseVariantGroups(product.variantsJson);
	const selectedVariants = buildInitialSelectedVariants({
		groups: variantGroups,
		rawSelectedVariants,
	});

	if (!isVariantSelectionValid(variantGroups, selectedVariants)) {
		throw redirect(
			localizeHref(buildProductReservationStepOnePath(product.id), { locale }),
		);
	}

	if (!product.isReservable || product.stock < 1) {
		throw redirect(
			localizeHref(buildProductReservationStepOnePath(product.id), { locale }),
		);
	}

	return {
		product,
		quantity,
		selectedVariants,
		defaultPickupFullName: session.user.name ?? '',
		defaultPickupPhone: typeof userPhone === 'string' ? userPhone : '',
		backToProductHref: localizeHref(`/products/${product.id}`, { locale }),
	};
};

export const action = async ({ request, params }: Route.ActionArgs) => {
	const session = await requireAuthenticatedSession(request);
	const locale = resolveLocaleFromRequest(request);

	if (!params.productId) {
		return {
			formError: m.reservation_create_product_not_found({}, { locale }),
		};
	}

	const formData = await request.formData();
	const pickupFullName = String(formData.get('pickupFullName') ?? '').trim();
	const pickupPhone = String(formData.get('pickupPhone') ?? '').trim();
	const quantity = parseQuantityParam(String(formData.get('quantity') ?? '1'));
	const selectedVariants = decodeSelectedVariantsParam(
		String(formData.get('selectedVariants') ?? '[]'),
	);

	const fieldErrors: {
		pickupFullName?: string;
		pickupPhone?: string;
	} = {};

	if (pickupFullName.length === 0) {
		fieldErrors.pickupFullName =
			m.reservation_create_validation_pickup_name_required({}, { locale });
	}

	if (pickupPhone.length === 0) {
		fieldErrors.pickupPhone =
			m.reservation_create_validation_pickup_phone_required({}, { locale });
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { fieldErrors };
	}

	try {
		const reservation = await createReservationFromFlow({
			productId: params.productId,
			customerUserId: session.user.id,
			quantity,
			pickupFullName,
			pickupPhone,
			selectedVariants,
		});

		return redirect(
			localizeHref(
				buildProductReservationStepThreePath({
					productId: params.productId,
					reservationId: reservation.reservationId,
				}),
				{ locale },
			),
		);
	} catch (error) {
		if (error instanceof ReservationCreationError) {
			if (error.code === 'PRODUCT_NOT_FOUND') {
				return {
					formError: m.reservation_create_product_not_found({}, { locale }),
				};
			}
			if (error.code === 'PRODUCT_NOT_RESERVABLE') {
				return {
					formError: m.reservation_create_product_not_reservable(
						{},
						{ locale },
					),
				};
			}
			if (error.code === 'PRODUCT_OUT_OF_STOCK') {
				return {
					formError: m.reservation_create_product_out_of_stock({}, { locale }),
				};
			}
			if (error.code === 'INVALID_VARIANTS') {
				return {
					formError: m.reservation_create_invalid_variants({}, { locale }),
				};
			}
		}

		return {
			formError: m.reservation_create_error({}, { locale }),
		};
	}
};

export default function ProductReservationStepTwoRoute({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const navigation = useNavigation();
	const [pickupFullName, setPickupFullName] = useState(
		loaderData.defaultPickupFullName,
	);
	const [pickupPhone, setPickupPhone] = useState(loaderData.defaultPickupPhone);
	const isSubmitting = navigation.state === 'submitting';
	const selectedVariantsJson = encodeSelectedVariantsParam(
		loaderData.selectedVariants,
	);

	if (!loaderData.product) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
				<div className="rounded-xl border p-6 text-center">
					<h1 className="text-lg font-semibold text-foreground">
						{m.reservation_flow_product_not_found_title()}
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{m.reservation_flow_product_not_found_description()}
					</p>
					<div className="mt-4">
						<Button
							nativeButton={false}
							render={
								<Link
									to={loaderData.backToProductHref ?? localizeHref('/stores')}
								/>
							}
						>
							{m.reservation_flow_back_to_stores()}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ReservationStepTemplate
			title={m.reservation_flow_step_two_title()}
			description={m.reservation_flow_step_two_description()}
			currentStep={2}
			stepOneLabel={m.reservation_flow_stepper_step_one()}
			stepTwoLabel={m.reservation_flow_stepper_step_two()}
			stepThreeLabel={m.reservation_flow_stepper_step_three()}
		>
			<ReservationProductSummaryOrganism
				product={{
					name: loaderData.product.name,
					priceOriginal: loaderData.product.priceOriginal,
					priceDiscount: loaderData.product.priceDiscount,
					storeName: loaderData.product.store.name,
					storeFloor: loaderData.product.store.floor,
					storeOpenHours: loaderData.product.store.openHours,
				}}
				priceLabel={m.reservation_flow_summary_price_label()}
				floorLabel={m.reservation_flow_summary_floor_label()}
				hoursLabel={m.reservation_flow_summary_hours_label()}
			/>

			{actionData?.formError && (
				<Alert variant="destructive">
					<AlertDescription>{actionData.formError}</AlertDescription>
				</Alert>
			)}

			<ReservationStepTwoFormOrganism
				pickupFullName={pickupFullName}
				pickupPhone={pickupPhone}
				quantity={loaderData.quantity}
				selectedVariantsJson={selectedVariantsJson}
				isSubmitting={isSubmitting}
				pickupFullNameLabel={m.reservation_flow_step_two_pickup_name_label()}
				pickupPhoneLabel={m.reservation_flow_step_two_pickup_phone_label()}
				pickupPhonePlaceholder={m.reservation_flow_step_two_pickup_phone_placeholder()}
				pickupFullNameRequiredMessage={actionData?.fieldErrors?.pickupFullName}
				pickupPhoneRequiredMessage={actionData?.fieldErrors?.pickupPhone}
				confirmLabel={m.reservation_flow_step_two_confirm()}
				submittingLabel={m.reservation_flow_step_two_submitting()}
				onPickupFullNameChange={setPickupFullName}
				onPickupPhoneChange={setPickupPhone}
			/>
		</ReservationStepTemplate>
	);
}
