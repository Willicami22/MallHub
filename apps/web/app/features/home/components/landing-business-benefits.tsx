import {
	Building01Icon,
	Store02Icon,
	Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@mallhub/ui';
import * as m from '@/paraglide/messages.js';

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
					id="landing-biz-diagonal"
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

			<rect width="100%" height="100%" fill="url(#landing-biz-diagonal)" />

			{/* Atmospheric glow — top-left corner */}
			<circle cx="0" cy="0" r="280" fill="currentColor" opacity="0.06" />

			{/* Orbital rings */}
			<circle
				cx="50%"
				cy="50%"
				r="220"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.8"
				opacity="0.05"
			/>
			<circle
				cx="50%"
				cy="50%"
				r="140"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.6"
				opacity="0.07"
			/>
		</svg>
	);
}

const storeFeatures = [
	m.landing_business_store_catalog,
	m.landing_business_store_promos,
	m.landing_business_store_reservations,
] as const;

const mallFeatures = [
	m.landing_business_mall_visibility,
	m.landing_business_mall_reports,
	m.landing_business_mall_panel,
] as const;

export function LandingBusinessBenefits() {
	return (
		<section className="relative overflow-hidden bg-primary">
			<DecorativeSvg />

			{/* Ghosted letterforms */}
			<div
				className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center overflow-hidden text-primary-foreground opacity-5"
				aria-hidden="true"
			>
				<span className="text-9xl font-black uppercase leading-none tracking-tighter">
					MALL
				</span>
				<span className="text-9xl font-black uppercase leading-none tracking-tighter">
					HUB
				</span>
			</div>

			<div className="relative z-10 mx-auto max-w-6xl px-6 py-16 text-primary-foreground md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
						{m.landing_business_title()}
					</h2>
					<p className="opacity-60">{m.landing_business_subtitle()}</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
					{/* Stores card */}
					<div className="rounded-2xl border border-current/10 bg-primary-foreground/10 p-6 md:p-8">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-xl border border-current/15 bg-current/10">
								<HugeiconsIcon
									icon={Store02Icon}
									className="size-5"
									strokeWidth={1.5}
								/>
							</div>
							<h3 className="text-lg font-semibold">
								{m.landing_business_store_title()}
							</h3>
						</div>
						<ul className="mt-6 space-y-3">
							{storeFeatures.map((getFeature) => (
								<li key={getFeature()} className="flex items-start gap-2.5">
									<HugeiconsIcon
										icon={Tick02Icon}
										className="mt-0.5 size-4 shrink-0 opacity-75"
									/>
									<span className="text-sm opacity-80">{getFeature()}</span>
								</li>
							))}
						</ul>
						<Button variant="secondary" size="lg" className="mt-6 w-full">
							{m.landing_business_store_cta()}
						</Button>
					</div>

					{/* Malls card */}
					<div className="rounded-2xl border border-current/10 bg-primary-foreground/10 p-6 md:p-8">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-xl border border-current/15 bg-current/10">
								<HugeiconsIcon
									icon={Building01Icon}
									className="size-5"
									strokeWidth={1.5}
								/>
							</div>
							<h3 className="text-lg font-semibold">
								{m.landing_business_mall_title()}
							</h3>
						</div>
						<ul className="mt-6 space-y-3">
							{mallFeatures.map((getFeature) => (
								<li key={getFeature()} className="flex items-start gap-2.5">
									<HugeiconsIcon
										icon={Tick02Icon}
										className="mt-0.5 size-4 shrink-0 opacity-75"
									/>
									<span className="text-sm opacity-80">{getFeature()}</span>
								</li>
							))}
						</ul>
						<Button variant="secondary" size="lg" className="mt-6 w-full">
							{m.landing_business_mall_cta()}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
