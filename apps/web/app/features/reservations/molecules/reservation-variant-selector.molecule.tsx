import { Field, FieldError, FieldGroup, FieldLabel } from '@mallhub/ui';
import { VariantOptionChipAtom } from '@/features/reservations/atoms/variant-option-chip.atom';
import type {
	SelectedVariant,
	VariantGroup,
} from '@/features/reservations/lib/reservation-flow.lib';

export function ReservationVariantSelectorMolecule({
	title,
	invalidMessage,
	groups,
	selectedVariants,
	onSelect,
}: {
	title: string;
	invalidMessage: string;
	groups: VariantGroup[];
	selectedVariants: SelectedVariant[];
	onSelect: (groupType: string, option: string) => void;
}) {
	if (groups.length === 0) {
		return null;
	}

	const selectedByType = Object.fromEntries(
		selectedVariants.map((selectedVariant) => [
			selectedVariant.type,
			selectedVariant.option,
		]),
	);
	const isInvalid = groups.some((group) => {
		const selectedOption = selectedByType[group.type];
		return !selectedOption || !group.options.includes(selectedOption);
	});

	return (
		<FieldGroup>
			{groups.map((group) => (
				<Field key={group.type} data-invalid={isInvalid} className="gap-2">
					<FieldLabel>{`${title}: ${group.type}`}</FieldLabel>
					<div className="flex flex-wrap gap-2">
						{group.options.map((option) => (
							<VariantOptionChipAtom
								key={`${group.type}-${option}`}
								label={option}
								active={selectedByType[group.type] === option}
								onClick={() => onSelect(group.type, option)}
							/>
						))}
					</div>
				</Field>
			))}
			{isInvalid && <FieldError>{invalidMessage}</FieldError>}
		</FieldGroup>
	);
}
