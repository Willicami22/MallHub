import { Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import { ReservationStepperMolecule } from '@/features/reservations/molecules/reservation-stepper.molecule';

export function ReservationStepTemplate({
	title,
	description,
	currentStep,
	stepOneLabel,
	stepTwoLabel,
	stepThreeLabel,
	children,
}: {
	title: string;
	description: string;
	currentStep: 1 | 2 | 3;
	stepOneLabel: string;
	stepTwoLabel: string;
	stepThreeLabel: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			<Card>
				<CardHeader className="space-y-3">
					<ReservationStepperMolecule
						currentStep={currentStep}
						stepOneLabel={stepOneLabel}
						stepTwoLabel={stepTwoLabel}
						stepThreeLabel={stepThreeLabel}
					/>
					<div>
						<CardTitle className="text-xl">{title}</CardTitle>
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">{children}</CardContent>
			</Card>
		</div>
	);
}
