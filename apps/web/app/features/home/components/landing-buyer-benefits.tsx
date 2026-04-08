import {
	Compass01Icon,
	Discount01Icon,
	Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as m from '@/paraglide/messages.js';

const benefits = [
	{
		icon: Compass01Icon,
		getTitle: m.landing_buyers_discovery_title,
		getDesc: m.landing_buyers_discovery_desc,
	},
	{
		icon: Discount01Icon,
		getTitle: m.landing_buyers_offers_title,
		getDesc: m.landing_buyers_offers_desc,
	},
	{
		// TODO: Replace with an icon about frictionless/fast checkout
		icon: Tick02Icon,
		getTitle: m.landing_buyers_pickup_title,
		getDesc: m.landing_buyers_pickup_desc,
	},
] as const;

export function LandingBuyerBenefits() {
	return (
		<section className="bg-background">
			<div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{m.landing_buyers_title()}
					</h2>
					<p className="text-muted-foreground">{m.landing_buyers_subtitle()}</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
					{benefits.map((benefit) => (
						<div
							key={benefit.getTitle()}
							className="rounded-xl border bg-card p-6"
						>
							<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
								<HugeiconsIcon
									icon={benefit.icon}
									className="size-5 text-primary"
								/>
							</div>
							<h3 className="mt-4 text-base font-semibold text-foreground">
								{benefit.getTitle()}
							</h3>
							<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
								{benefit.getDesc()}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
