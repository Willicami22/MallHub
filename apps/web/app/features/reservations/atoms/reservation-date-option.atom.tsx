import { Button, cn } from '@mallhub/ui';

export function ReservationDateOptionAtom({
	label,
	isSelected,
	disabled,
	onSelect,
}: {
	label: string;
	isSelected: boolean;
	disabled?: boolean;
	onSelect: () => void;
}) {
	return (
		<Button
			type="button"
			size="sm"
			variant={isSelected ? 'default' : 'outline'}
			className={cn('min-w-24', isSelected && 'pointer-events-none')}
			disabled={disabled}
			onClick={onSelect}
		>
			{label}
		</Button>
	);
}
