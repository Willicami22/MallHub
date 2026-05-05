import { Button, FieldError } from '@mallhub/ui';
import type {
	SelectedVariant,
	VariantGroup,
} from '@/features/reservations/lib/reservation-flow.lib';
import { ReservationQuantitySelectorMolecule } from '@/features/reservations/molecules/reservation-quantity-selector.molecule';
import { ReservationVariantSelectorMolecule } from '@/features/reservations/molecules/reservation-variant-selector.molecule';
import { StoreClosedWarningBannerMolecule } from '@/features/reservations/molecules/store-closed-warning-banner.molecule';

export function ReservationStepOneFormOrganism({
	variantGroups,
	selectedVariants,
	quantity,
	stock,
	isStoreClosed,
	isSubmitting,
	continueDisabled,
	variantTitle,
	variantInvalidMessage,
	quantityLabel,
	quantityInvalidMessage,
	storeClosedTitle,
	storeClosedDescription,
	outOfStockMessage,
	continueLabel,
	onSelectVariant,
	onQuantityChange,
	onContinue,
}: {
	variantGroups: VariantGroup[];
	selectedVariants: SelectedVariant[];
	quantity: number;
	stock: number;
	isStoreClosed: boolean;
	isSubmitting: boolean;
	continueDisabled: boolean;
	variantTitle: string;
	variantInvalidMessage: string;
	quantityLabel: string;
	quantityInvalidMessage: string;
	storeClosedTitle: string;
	storeClosedDescription: string;
	outOfStockMessage: string;
	continueLabel: string;
	onSelectVariant: (groupType: string, option: string) => void;
	onQuantityChange: (nextValue: number) => void;
	onContinue: () => void;
}) {
	return (
		<div className="space-y-5">
			{isStoreClosed && (
				<StoreClosedWarningBannerMolecule
					title={storeClosedTitle}
					description={storeClosedDescription}
				/>
			)}

			<ReservationVariantSelectorMolecule
				title={variantTitle}
				invalidMessage={variantInvalidMessage}
				groups={variantGroups}
				selectedVariants={selectedVariants}
				onSelect={onSelectVariant}
			/>

			<ReservationQuantitySelectorMolecule
				label={quantityLabel}
				value={quantity}
				min={1}
				max={Math.max(1, stock)}
				invalidMessage={quantityInvalidMessage}
				onChange={onQuantityChange}
			/>

			{stock < 1 && <FieldError>{outOfStockMessage}</FieldError>}

			<Button
				type="button"
				className="w-full"
				disabled={continueDisabled || isSubmitting}
				onClick={onContinue}
			>
				{continueLabel}
			</Button>
		</div>
	);
}
