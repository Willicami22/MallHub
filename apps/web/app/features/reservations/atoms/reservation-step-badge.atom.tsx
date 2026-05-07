import { cn } from '@mallhub/ui';

export function ReservationStepBadgeAtom({
	label,
	step,
	currentStep,
}: {
	label: string;
	step: number;
	currentStep: number;
}) {
	const isCompleted = step < currentStep;
	const isCurrent = step === currentStep;

	return (
		<div className="flex items-center gap-2">
			<div
				className={cn(
					'flex size-7 items-center justify-center rounded-full border text-xs font-semibold',
					isCompleted && 'border-primary bg-primary text-primary-foreground',
					isCurrent && 'border-primary text-primary',
					!isCompleted && !isCurrent && 'border-border text-muted-foreground',
				)}
			>
				{step}
			</div>
			<span
				className={cn(
					'text-xs',
					isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
				)}
			>
				{label}
			</span>
		</div>
	);
}
