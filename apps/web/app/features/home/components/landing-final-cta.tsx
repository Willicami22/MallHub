import { Button } from '@mallhub/ui';
import { Link } from 'react-router';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

function DecorativeSvg() {
	return (
		<svg
			className="absolute inset-0 h-full w-full text-primary-foreground"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<pattern
					id="landing-cta-diagonal"
					width="64"
					height="64"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45 0 0)"
				>
					<line
						x1="0"
						y1="0"
						x2="64"
						y2="0"
						stroke="currentColor"
						strokeWidth="0.6"
						opacity="0.07"
					/>
				</pattern>
			</defs>

			<rect width="100%" height="100%" fill="url(#landing-cta-diagonal)" />
			<circle cx="100%" cy="100%" r="320" fill="currentColor" opacity="0.06" />
			<circle
				cx="50%"
				cy="50%"
				r="180"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.6"
				opacity="0.06"
			/>
		</svg>
	);
}

export function LandingFinalCta() {
	return (
		<section className="relative overflow-hidden bg-primary">
			<DecorativeSvg />

			<div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center text-primary-foreground md:py-24">
				<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
					{m.landing_cta_title()}
				</h2>
				<p className="mt-4 opacity-60">{m.landing_cta_subtitle()}</p>
				<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
					<Button
						variant="secondary"
						size="lg"
						nativeButton={false}
						render={<Link to={localizeHref('/auth/register')} />}
					>
						{m.landing_cta_button()}
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
						nativeButton={false}
						render={<Link to={localizeHref('/auth/login')} />}
					>
						{m.landing_cta_login()}
					</Button>
				</div>
				<div className="mt-4">
					<Button
						variant="ghost"
						size="sm"
						nativeButton={false}
						render={<Link to={localizeHref('/malls')} />}
						className="text-primary-foreground/60 underline-offset-4 hover:bg-transparent hover:text-primary-foreground hover:underline"
					>
						{m.landing_cta_guest()}
					</Button>
				</div>
			</div>
		</section>
	);
}
