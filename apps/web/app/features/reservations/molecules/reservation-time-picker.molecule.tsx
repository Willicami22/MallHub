import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@mallhub/ui';

type TimeOption = {
	value: string;
	label: string;
};

export function ReservationTimePickerMolecule({
	label,
	description,
	placeholder,
	unavailableMessage,
	options,
	value,
	onTimeChange,
}: {
	label: string;
	description: string;
	placeholder: string;
	unavailableMessage: string;
	options: TimeOption[];
	value: string;
	onTimeChange: (nextValue: string) => void;
}) {
	return (
		<Field data-disabled={options.length === 0}>
			<FieldLabel>{label}</FieldLabel>
			<FieldDescription>{description}</FieldDescription>
			<Select
				items={options}
				value={value}
				onValueChange={(nextValue) => onTimeChange(nextValue ?? '')}
				disabled={options.length === 0}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{options.length === 0 && <FieldError>{unavailableMessage}</FieldError>}
		</Field>
	);
}
