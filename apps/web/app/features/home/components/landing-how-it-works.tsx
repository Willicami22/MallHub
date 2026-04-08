import {
	QrCode01Icon,
	Search01Icon,
	ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as m from '@/paraglide/messages.js';

const steps = [
	{
		icon: Search01Icon,
		getTitle: m.landing_steps_1_title,
		getDesc: m.landing_steps_1_desc,
	},
	{
		icon: ShoppingBag01Icon,
		getTitle: m.landing_steps_2_title,
		getDesc: m.landing_steps_2_desc,
	},
	{
		icon: QrCode01Icon,
		getTitle: m.landing_steps_3_title,
		getDesc: m.landing_steps_3_desc,
	},
] as const;

const STEP_NUMBERS = ['01', '02', '03'] as const;

export function LandingHowItWorks() {
	return (
		<section id="how-it-works" className="bg-muted">
			<div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{m.landing_steps_title()}
					</h2>
					<p className="text-muted-foreground">{m.landing_steps_subtitle()}</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
					{steps.map((step, i) => (
						<div
							key={step.getTitle()}
							className="relative flex flex-col items-center text-center"
						>
							<div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
								<HugeiconsIcon icon={step.icon} className="size-6" />
							</div>
							<span className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
								{STEP_NUMBERS[i]}
							</span>
							<h3 className="mt-2 text-lg font-semibold text-foreground">
								{step.getTitle()}
							</h3>
							<p className="mt-2 max-w-xs text-sm text-muted-foreground">
								{step.getDesc()}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
