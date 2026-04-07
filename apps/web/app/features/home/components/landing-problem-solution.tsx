import { Separator } from '@mallhub/ui';
import * as m from '@/paraglide/messages.js';

const audiences = [
	{
		getLabel: m.landing_problem_buyer_label,
		getBefore: m.landing_problem_buyer_before,
		getAfter: m.landing_problem_buyer_after,
	},
	{
		getLabel: m.landing_problem_store_label,
		getBefore: m.landing_problem_store_before,
		getAfter: m.landing_problem_store_after,
	},
] as const;

export function LandingProblemSolution() {
	return (
		<section className="bg-background">
			<div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{m.landing_problem_title()}
					</h2>
					<p className="text-muted-foreground">
						{m.landing_problem_subtitle()}
					</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
					{audiences.map((audience) => (
						<div
							key={audience.getLabel()}
							className="rounded-xl border bg-card p-6 md:p-8"
						>
							<h3 className="text-lg font-semibold text-foreground">
								{audience.getLabel()}
							</h3>

							<div className="mt-5 space-y-4">
								<div>
									<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										{m.landing_problem_before_label()}
									</span>
									<p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
										{audience.getBefore()}
									</p>
								</div>

								<Separator />

								<div>
									<span className="text-xs font-medium uppercase tracking-wide text-primary">
										{m.landing_problem_after_label()}
									</span>
									<p className="mt-1.5 text-sm text-foreground leading-relaxed">
										{audience.getAfter()}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
