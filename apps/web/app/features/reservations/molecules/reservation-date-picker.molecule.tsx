import { Field, FieldDescription, FieldError, FieldLabel } from '@mallhub/ui';
import { ReservationDateOptionAtom } from '@/features/reservations/atoms/reservation-date-option.atom';

type DateOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

export function ReservationDatePickerMolecule({
	label,
	description,
	options,
	selectedValue,
	unavailableMessage,
	onDateChange,
}: {
	label: string;
	description: string;
	options: DateOption[];
	selectedValue: string;
	unavailableMessage: string;
	onDateChange: (nextValue: string) => void;
}) {
	return (
		<Field data-disabled={options.length === 0}>
			<FieldLabel>{label}</FieldLabel>
			<FieldDescription>{description}</FieldDescription>
			<div className="mt-2 flex flex-wrap gap-2">
				{options.map((option) => (
					<ReservationDateOptionAtom
						key={option.value}
						label={option.label}
						isSelected={option.value === selectedValue}
						disabled={option.disabled}
						onSelect={() => onDateChange(option.value)}
					/>
				))}
			</div>
			{options.length === 0 && <FieldError>{unavailableMessage}</FieldError>}
		</Field>
	);
}
