import { Button } from '@mallhub/ui';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useNavigation } from 'react-router';
import { requireAuthenticatedSession } from '@/features/.server/auth/auth-route-guard.lib';
import { findReservableProduct } from '@/features/.server/reservations/reservation-flow.server.lib';
import { resolveLocaleFromRequest } from '@/features/.server/trpc/locale.context';
import {
	buildProductReservationStepTwoPath,
	decodeSelectedVariantsParam,
	encodeSelectedVariantsParam,
	isStoreOpenNow,
	isVariantSelectionValid,
	parseQuantityParam,
	parseVariantGroups,
	type SelectedVariant,
	toVariantSelectionMap,
	type VariantGroup,
} from '@/features/reservations/lib/reservation-flow.lib';
import { ReservationProductSummaryOrganism } from '@/features/reservations/organisms/reservation-product-summary.organism';
import { ReservationStepOneFormOrganism } from '@/features/reservations/organisms/reservation-step-one-form.organism';
import { ReservationStepTemplate } from '@/features/reservations/templates/reservation-step.template';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/product-reservation-step-one.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.reservation_flow_step_one_meta_title() },
];

function buildInitialSelectedVariants({
	groups,
	rawSelectedVariants,
}: {
	groups: VariantGroup[];
	rawSelectedVariants: SelectedVariant[];
}): SelectedVariant[] {
	const requestedMap = toVariantSelectionMap(rawSelectedVariants);

	return groups.map((group) => {
		const requestedOption = requestedMap[group.type];
		const fallbackOption = group.options[0] ?? '';

		return {
			type: group.type,
			option: group.options.includes(requestedOption)
				? requestedOption
				: fallbackOption,
		};
	});
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	await requireAuthenticatedSession(request);

	if (!params.productId) {
		return {
			product: null,
			initialQuantity: 1,
			initialSelectedVariants: [] as SelectedVariant[],
		};
	}

	const locale = resolveLocaleFromRequest(request);
	const product = await findReservableProduct(params.productId);

	if (!product) {
		return {
			product: null,
			initialQuantity: 1,
			initialSelectedVariants: [] as SelectedVariant[],
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

	return {
		product,
		initialQuantity: quantity,
		initialSelectedVariants: buildInitialSelectedVariants({
			groups: variantGroups,
			rawSelectedVariants,
		}),
		backToProductHref: localizeHref(`/products/${product.id}`, { locale }),
	};
};

export default function ProductReservationStepOneRoute({
	loaderData,
}: Route.ComponentProps) {
	const navigate = useNavigate();
	const navigation = useNavigation();
	const variantGroups = useMemo(
		() => parseVariantGroups(loaderData.product?.variantsJson ?? '[]'),
		[loaderData.product?.variantsJson],
	);
	const [quantity, setQuantity] = useState(loaderData.initialQuantity);
	const [selectedVariants, setSelectedVariants] = useState(
		loaderData.initialSelectedVariants,
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
	const storeIsClosed = !isStoreOpenNow(loaderData.product.store.openHours);
	const canContinue =
		loaderData.product.isReservable &&
		loaderData.product.stock > 0 &&
		quantity >= 1 &&
		quantity <= loaderData.product.stock &&
		isVariantSelectionValid(variantGroups, selectedVariants);
	const isNavigatingToStepTwo =
		navigation.state !== 'idle' &&
		navigation.location?.pathname ===
			localizeHref(buildProductReservationStepTwoPath(loaderData.product.id));

	return (
		<ReservationStepTemplate
			title={m.reservation_flow_step_one_title()}
			description={m.reservation_flow_step_one_description()}
			currentStep={1}
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

			<ReservationStepOneFormOrganism
				variantGroups={variantGroups}
				selectedVariants={selectedVariants}
				quantity={quantity}
				stock={loaderData.product.stock}
				isStoreClosed={storeIsClosed}
				isSubmitting={isNavigatingToStepTwo}
				continueDisabled={!canContinue}
				variantTitle={m.reservation_flow_step_one_variants_title()}
				variantInvalidMessage={m.reservation_flow_step_one_variants_invalid()}
				quantityLabel={m.reservation_flow_step_one_quantity_label()}
				quantityInvalidMessage={m.reservation_flow_step_one_quantity_invalid()}
				storeClosedTitle={m.reservation_flow_step_one_store_closed_title()}
				storeClosedDescription={m.reservation_flow_step_one_store_closed_description()}
				outOfStockMessage={m.reservation_flow_step_one_out_of_stock()}
				continueLabel={m.reservation_flow_step_one_continue()}
				onSelectVariant={(groupType, option) =>
					setSelectedVariants((previousSelectedVariants) => {
						const selectedByType = new Map(
							previousSelectedVariants.map((selectedVariant) => [
								selectedVariant.type,
								selectedVariant.option,
							]),
						);
						selectedByType.set(groupType, option);

						return [...selectedByType.entries()].map(
							([type, selectedOption]) => ({
								type,
								option: selectedOption,
							}),
						);
					})
				}
				onQuantityChange={setQuantity}
				onContinue={() => {
					if (!canContinue) {
						return;
					}

					const searchParams = new URLSearchParams();
					searchParams.set('quantity', String(quantity));
					if (selectedVariants.length > 0) {
						searchParams.set(
							'variants',
							encodeSelectedVariantsParam(selectedVariants),
						);
					}

					navigate(
						localizeHref(
							`${buildProductReservationStepTwoPath(loaderData.product.id)}?${searchParams.toString()}`,
						),
					);
				}}
			/>
		</ReservationStepTemplate>
	);
}
