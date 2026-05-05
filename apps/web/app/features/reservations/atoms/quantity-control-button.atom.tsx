import { cn } from '@mallhub/ui';

export function QuantityControlButtonAtom({
	label,
	onClick,
	disabled,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				'flex h-9 w-9 items-center justify-center rounded-md border text-base font-semibold transition-colors',
				'border-border bg-background text-foreground hover:border-foreground/30',
				'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
			)}
		>
			{label}
		</button>
	);
}
