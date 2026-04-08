import {
	Building01Icon,
	Package01Icon,
	Store02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as m from '@/paraglide/messages.js';

const stats = [
	{
		icon: Building01Icon,
		getValue: m.landing_stats_malls_value,
		getLabel: m.landing_stats_malls_label,
	},
	{
		icon: Store02Icon,
		getValue: m.landing_stats_stores_value,
		getLabel: m.landing_stats_stores_label,
	},
	{
		icon: Package01Icon,
		getValue: m.landing_stats_reservations_value,
		getLabel: m.landing_stats_reservations_label,
	},
] as const;

export function LandingStats() {
	return (
		<section className="bg-muted">
			<div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
					{stats.map((stat) => (
						<div
							key={stat.getLabel()}
							className="flex flex-col items-center gap-2 text-center"
						>
							<HugeiconsIcon icon={stat.icon} className="size-5 text-primary" />
							<p className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
								{stat.getValue()}
							</p>
							<p className="text-sm text-muted-foreground">{stat.getLabel()}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
