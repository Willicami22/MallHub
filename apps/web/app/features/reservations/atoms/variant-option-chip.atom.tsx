import { cn } from '@mallhub/ui';

export function VariantOptionChipAtom({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
				active
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border bg-background text-foreground hover:border-foreground/30',
			)}
		>
			{label}
		</button>
	);
}
