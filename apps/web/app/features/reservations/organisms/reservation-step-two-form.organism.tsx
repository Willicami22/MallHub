import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	Input,
	Spinner,
} from '@mallhub/ui';
import { Form } from 'react-router';

export function ReservationStepTwoFormOrganism({
	pickupFullName,
	pickupPhone,
	quantity,
	selectedVariantsJson,
	isSubmitting,
	pickupFullNameLabel,
	pickupPhoneLabel,
	pickupPhonePlaceholder,
	pickupFullNameRequiredMessage,
	pickupPhoneRequiredMessage,
	confirmLabel,
	submittingLabel,
	onPickupFullNameChange,
	onPickupPhoneChange,
}: {
	pickupFullName: string;
	pickupPhone: string;
	quantity: number;
	selectedVariantsJson: string;
	isSubmitting: boolean;
	pickupFullNameLabel: string;
	pickupPhoneLabel: string;
	pickupPhonePlaceholder: string;
	pickupFullNameRequiredMessage?: string;
	pickupPhoneRequiredMessage?: string;
	confirmLabel: string;
	submittingLabel: string;
	onPickupFullNameChange: (nextValue: string) => void;
	onPickupPhoneChange: (nextValue: string) => void;
}) {
	return (
		<Form method="post" className="space-y-5">
			<input type="hidden" name="quantity" value={quantity} />
			<input
				type="hidden"
				name="selectedVariants"
				value={selectedVariantsJson}
			/>
			<FieldGroup>
				<Field data-invalid={Boolean(pickupFullNameRequiredMessage)}>
					<FieldLabel htmlFor="pickup-full-name">
						{pickupFullNameLabel}
					</FieldLabel>
					<Input
						id="pickup-full-name"
						name="pickupFullName"
						value={pickupFullName}
						onChange={(event) => onPickupFullNameChange(event.target.value)}
						autoComplete="name"
						aria-invalid={Boolean(pickupFullNameRequiredMessage)}
						disabled={isSubmitting}
					/>
					{pickupFullNameRequiredMessage && (
						<FieldError>{pickupFullNameRequiredMessage}</FieldError>
					)}
				</Field>

				<Field data-invalid={Boolean(pickupPhoneRequiredMessage)}>
					<FieldLabel htmlFor="pickup-phone">{pickupPhoneLabel}</FieldLabel>
					<Input
						id="pickup-phone"
						name="pickupPhone"
						value={pickupPhone}
						onChange={(event) => onPickupPhoneChange(event.target.value)}
						autoComplete="tel"
						placeholder={pickupPhonePlaceholder}
						aria-invalid={Boolean(pickupPhoneRequiredMessage)}
						disabled={isSubmitting}
					/>
					{pickupPhoneRequiredMessage && (
						<FieldError>{pickupPhoneRequiredMessage}</FieldError>
					)}
				</Field>
			</FieldGroup>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? (
					<>
						<Spinner />
						{submittingLabel}
					</>
				) : (
					confirmLabel
				)}
			</Button>
		</Form>
	);
}
