import {
	Analytics01Icon,
	Compass01Icon,
	QrCode01Icon,
	Search01Icon,
	StoreManagement01Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as m from '@/paraglide/messages.js';

const features = [
	{
		icon: Search01Icon,
		getTitle: m.landing_features_search_title,
		getDesc: m.landing_features_search_desc,
	},
	{
		icon: Tag01Icon,
		getTitle: m.landing_features_promos_title,
		getDesc: m.landing_features_promos_desc,
	},
	{
		icon: QrCode01Icon,
		getTitle: m.landing_features_pickup_title,
		getDesc: m.landing_features_pickup_desc,
	},
	{
		icon: StoreManagement01Icon,
		getTitle: m.landing_features_store_title,
		getDesc: m.landing_features_store_desc,
	},
	{
		icon: Analytics01Icon,
		getTitle: m.landing_features_insights_title,
		getDesc: m.landing_features_insights_desc,
	},
	{
		// TODO: Replace with an icon about mall/building navigation
		icon: Compass01Icon,
		getTitle: m.landing_features_navigation_title,
		getDesc: m.landing_features_navigation_desc,
	},
] as const;

export function LandingFeatures() {
	return (
		<section className="bg-background">
			<div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{m.landing_features_title()}
					</h2>
					<p className="text-muted-foreground">
						{m.landing_features_subtitle()}
					</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.getTitle()}
							className="rounded-xl border bg-card p-6"
						>
							<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
								<HugeiconsIcon
									icon={feature.icon}
									className="size-5 text-primary"
								/>
							</div>
							<h3 className="mt-4 text-sm font-semibold text-foreground">
								{feature.getTitle()}
							</h3>
							<p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
								{feature.getDesc()}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
