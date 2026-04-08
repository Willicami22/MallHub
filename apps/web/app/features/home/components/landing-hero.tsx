import {
	Clock01Icon,
	Shield01Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@mallhub/ui';
import { Link } from 'react-router';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

const trustSignals = [
	{ icon: Clock01Icon, getMessage: m.landing_hero_trust_1 },
	{ icon: Tag01Icon, getMessage: m.landing_hero_trust_2 },
	{ icon: Shield01Icon, getMessage: m.landing_hero_trust_3 },
] as const;

export function LandingHero() {
	return (
		<section className="bg-background">
			<div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
				<div className="space-y-8">
					<div className="space-y-5">
						<span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
							{m.landing_hero_eyebrow()}
						</span>

						<h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl lg:leading-[1.08]">
							{m.landing_hero_h1_line1()}
							<br />
							{m.landing_hero_h1_line2()}
							<br />
							<span className="text-primary">{m.landing_hero_h1_line3()}</span>
						</h1>

						<p className="max-w-lg text-base text-muted-foreground md:text-lg">
							{m.landing_hero_subtitle()}
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							size="lg"
							nativeButton={false}
							render={<Link to={localizeHref('/auth/register')} />}
						>
							{m.landing_hero_cta_primary()}
						</Button>
						<Button
							variant="outline"
							size="lg"
							nativeButton={false}
							render={
								<Link
									to="#how-it-works"
									aria-label={m.landing_hero_cta_secondary()}
								/>
							}
						>
							{m.landing_hero_cta_secondary()}
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
						{trustSignals.map((signal) => (
							<div
								key={signal.getMessage()}
								className="flex items-center gap-2"
							>
								<HugeiconsIcon
									icon={signal.icon}
									className="size-4 text-primary"
								/>
								<span>{signal.getMessage()}</span>
							</div>
						))}
					</div>
				</div>

				<div className="hidden lg:flex lg:items-center lg:justify-center">
					{/* TODO: Replace with image about app mockup showing search results, active promo card, and QR reservation confirmation */}
					<div
						className="aspect-3/4 w-full max-w-sm rounded-3xl border bg-muted"
						aria-hidden="true"
					/>
				</div>
			</div>
		</section>
	);
}
