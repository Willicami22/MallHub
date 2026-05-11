import { Button, FieldError } from '@mallhub/ui';
import type {
	SelectedVariant,
	VariantGroup,
} from '@/features/reservations/lib/reservation-flow.lib';
import { ReservationQuantitySelectorMolecule } from '@/features/reservations/molecules/reservation-quantity-selector.molecule';
import { ReservationVariantSelectorMolecule } from '@/features/reservations/molecules/reservation-variant-selector.molecule';
import { StoreClosedWarningBannerMolecule } from '@/features/reservations/molecules/store-closed-warning-banner.molecule';
import { ReservationPickupDateTimeOrganism } from '@/features/reservations/organisms/reservation-pickup-date-time.organism';

export function ReservationStepOneFormOrganism({
	variantGroups,
	selectedVariants,
	quantity,
	stock,
	pickupDateValue,
	pickupDateOptions,
	pickupTimeValue,
	pickupTimeOptions,
	isStoreClosed,
	isSubmitting,
	continueDisabled,
	variantTitle,
	variantInvalidMessage,
	quantityLabel,
	quantityInvalidMessage,
	pickupDateLabel,
	pickupDateDescription,
	pickupDateUnavailableMessage,
	pickupTimeLabel,
	pickupTimeDescription,
	pickupTimePlaceholder,
	pickupTimeUnavailableMessage,
	storeClosedTitle,
	storeClosedDescription,
	outOfStockMessage,
	continueLabel,
	onPickupDateChange,
	onPickupTimeChange,
	onSelectVariant,
	onQuantityChange,
	onContinue,
}: {
	variantGroups: VariantGroup[];
	selectedVariants: SelectedVariant[];
	quantity: number;
	stock: number;
	pickupDateValue: string;
	pickupDateOptions: Array<{
		value: string;
		label: string;
		disabled?: boolean;
	}>;
	pickupTimeValue: string;
	pickupTimeOptions: Array<{ value: string; label: string }>;
	isStoreClosed: boolean;
	isSubmitting: boolean;
	continueDisabled: boolean;
	variantTitle: string;
	variantInvalidMessage: string;
	quantityLabel: string;
	quantityInvalidMessage: string;
	pickupDateLabel: string;
	pickupDateDescription: string;
	pickupDateUnavailableMessage: string;
	pickupTimeLabel: string;
	pickupTimeDescription: string;
	pickupTimePlaceholder: string;
	pickupTimeUnavailableMessage: string;
	storeClosedTitle: string;
	storeClosedDescription: string;
	outOfStockMessage: string;
	continueLabel: string;
	onPickupDateChange: (nextValue: string) => void;
	onPickupTimeChange: (nextValue: string) => void;
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

			<ReservationPickupDateTimeOrganism
				dateLabel={pickupDateLabel}
				dateDescription={pickupDateDescription}
				dateUnavailableMessage={pickupDateUnavailableMessage}
				dateOptions={pickupDateOptions}
				dateValue={pickupDateValue}
				timeLabel={pickupTimeLabel}
				timeDescription={pickupTimeDescription}
				timePlaceholder={pickupTimePlaceholder}
				timeUnavailableMessage={pickupTimeUnavailableMessage}
				timeOptions={pickupTimeOptions}
				timeValue={pickupTimeValue}
				onDateChange={onPickupDateChange}
				onTimeChange={onPickupTimeChange}
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
