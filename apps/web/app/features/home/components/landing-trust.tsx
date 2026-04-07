import {
	CheckmarkBadge01Icon,
	CreditCardValidationIcon,
	Shield01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as m from '@/paraglide/messages.js';

const trustItems = [
	{
		icon: Shield01Icon,
		getTitle: m.landing_trust_privacy_title,
		getDesc: m.landing_trust_privacy_desc,
	},
	{
		icon: CreditCardValidationIcon,
		getTitle: m.landing_trust_payments_title,
		getDesc: m.landing_trust_payments_desc,
	},
	{
		// TODO: Replace with an icon about accessibility/inclusive design
		icon: CheckmarkBadge01Icon,
		getTitle: m.landing_trust_accessibility_title,
		getDesc: m.landing_trust_accessibility_desc,
	},
] as const;

export function LandingTrust() {
	return (
		<section className="bg-muted">
			<div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{m.landing_trust_title()}
					</h2>
					<p className="text-muted-foreground">{m.landing_trust_subtitle()}</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
					{trustItems.map((item) => (
						<div
							key={item.getTitle()}
							className="flex flex-col items-center text-center"
						>
							<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
								<HugeiconsIcon
									icon={item.icon}
									className="size-6 text-primary"
								/>
							</div>
							<h3 className="mt-4 text-base font-semibold text-foreground">
								{item.getTitle()}
							</h3>
							<p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
								{item.getDesc()}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
