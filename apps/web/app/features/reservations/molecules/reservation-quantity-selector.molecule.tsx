import { Field, FieldError, FieldLabel } from '@mallhub/ui';
import { QuantityControlButtonAtom } from '@/features/reservations/atoms/quantity-control-button.atom';

export function ReservationQuantitySelectorMolecule({
	label,
	value,
	min,
	max,
	invalidMessage,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	invalidMessage: string;
	onChange: (nextValue: number) => void;
}) {
	const isInvalid = value < min || value > max;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel>{label}</FieldLabel>
			<div className="flex items-center gap-3">
				<QuantityControlButtonAtom
					label="-"
					onClick={() => onChange(Math.max(min, value - 1))}
					disabled={value <= min}
				/>
				<div className="min-w-12 text-center text-sm font-semibold text-foreground">
					{value}
				</div>
				<QuantityControlButtonAtom
					label="+"
					onClick={() => onChange(Math.min(max, value + 1))}
					disabled={value >= max}
				/>
			</div>
			{isInvalid && <FieldError>{invalidMessage}</FieldError>}
		</Field>
	);
}
