import { ReservationStepBadgeAtom } from '@/features/reservations/atoms/reservation-step-badge.atom';

export function ReservationStepperMolecule({
	currentStep,
	stepOneLabel,
	stepTwoLabel,
	stepThreeLabel,
}: {
	currentStep: 1 | 2 | 3;
	stepOneLabel: string;
	stepTwoLabel: string;
	stepThreeLabel: string;
}) {
	const steps = [
		{ id: 1 as const, label: stepOneLabel },
		{ id: 2 as const, label: stepTwoLabel },
		{ id: 3 as const, label: stepThreeLabel },
	];

	return (
		<div className="flex flex-wrap items-center gap-3">
			{steps.map((step) => (
				<ReservationStepBadgeAtom
					key={step.id}
					step={step.id}
					currentStep={currentStep}
					label={step.label}
				/>
			))}
		</div>
	);
}
