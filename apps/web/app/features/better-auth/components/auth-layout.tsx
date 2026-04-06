import {
	QrCode01Icon,
	Store02Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import * as m from '@/paraglide/messages.js';

/** Rotated crosshatch grid + concentric arcs emanating from the top-right corner */
function AuthBgSvg() {
	return (
		<svg
			className="absolute inset-0 h-full w-full text-primary-foreground"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<pattern
					id="auth-crosshatch"
					width="52"
					height="52"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(12 0 0)"
				>
					<line
						x1="0"
						y1="0"
						x2="52"
						y2="0"
						stroke="currentColor"
						strokeWidth="0.5"
						opacity="0.09"
					/>
					<line
						x1="0"
						y1="0"
						x2="0"
						y2="52"
						stroke="currentColor"
						strokeWidth="0.5"
						opacity="0.09"
					/>
				</pattern>
			</defs>

			<rect width="100%" height="100%" fill="url(#auth-crosshatch)" />

			<circle
				cx="100%"
				cy="0"
				r="460"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.05"
			/>
			<circle
				cx="100%"
				cy="0"
				r="360"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.07"
			/>
			<circle
				cx="100%"
				cy="0"
				r="265"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.09"
			/>
			<circle
				cx="100%"
				cy="0"
				r="178"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.11"
			/>
			<circle
				cx="100%"
				cy="0"
				r="100"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.8"
				opacity="0.14"
			/>

			<circle cx="0" cy="100%" r="220" fill="currentColor" opacity="0.05" />

			<line
				x1="0"
				y1="87%"
				x2="62%"
				y2="87%"
				stroke="currentColor"
				strokeWidth="0.5"
				opacity="0.12"
			/>
		</svg>
	);
}

/** Geometric brand mark: 2×2 grid of rounded squares with fading opacities,
 *  evoking a mall floor-plan / directory grid */
function BrandMark({ className }: { className?: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 22 22"
			fill="none"
			aria-hidden="true"
			className={className}
		>
			<rect
				x="0"
				y="0"
				width="9.5"
				height="9.5"
				rx="2.2"
				fill="currentColor"
				opacity="0.95"
			/>
			<rect
				x="12.5"
				y="0"
				width="9.5"
				height="9.5"
				rx="2.2"
				fill="currentColor"
				opacity="0.55"
			/>
			<rect
				x="0"
				y="12.5"
				width="9.5"
				height="9.5"
				rx="2.2"
				fill="currentColor"
				opacity="0.55"
			/>
			<rect
				x="12.5"
				y="12.5"
				width="9.5"
				height="9.5"
				rx="2.2"
				fill="currentColor"
				opacity="0.18"
			/>
		</svg>
	);
}

const features = [
	{
		icon: Store02Icon,
		getTitle: m.auth_feature_stores_title,
		getDesc: m.auth_feature_stores_desc,
	},
	{
		icon: QrCode01Icon,
		getTitle: m.auth_feature_pickup_title,
		getDesc: m.auth_feature_pickup_desc,
	},
	{
		icon: Tag01Icon,
		getTitle: m.auth_feature_deals_title,
		getDesc: m.auth_feature_deals_desc,
	},
] as const;

export function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh">
			<div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-[45%]">
				<AuthBgSvg />

				<div className="relative z-10 flex h-full flex-col justify-between px-12 py-10 text-primary-foreground">
					<div className="flex items-center gap-2.5">
						<BrandMark />
						<span className="text-xs font-semibold tracking-widest uppercase opacity-75">
							MallHub
						</span>
					</div>

					<div className="space-y-9">
						<div className="space-y-3">
							<p className="text-xs font-medium tracking-widest uppercase opacity-35">
								{m.auth_brand_eyebrow()}
							</p>

							<h2 className="text-5xl font-bold leading-[1.08] tracking-tight">
								{m.auth_brand_headline_1()}
								<br />
								{m.auth_brand_headline_2()}
								<br />
								<span className="opacity-35">{m.auth_brand_headline_3()}</span>
							</h2>

							<div className="flex items-center gap-2 pt-1">
								<div className="h-px w-10 bg-current opacity-30" />
								<div className="h-px w-3 bg-current opacity-15" />
							</div>
						</div>

						<div className="space-y-5">
							{features.map((feature) => (
								<div
									key={feature.getTitle()}
									className="flex items-start gap-4"
								>
									<div className="mt-px flex size-9 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-current/10">
										<HugeiconsIcon
											icon={feature.icon}
											className="size-4"
											strokeWidth={1.5}
										/>
									</div>
									<div>
										<p className="text-sm font-semibold leading-snug opacity-90">
											{feature.getTitle()}
										</p>
										<p className="mt-0.5 text-xs leading-relaxed opacity-40">
											{feature.getDesc()}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div>
						<div className="mb-3 h-px w-full bg-current opacity-10" />
						<p className="text-xs opacity-25">© 2026 MallHub</p>
					</div>
				</div>
			</div>

			<div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
				<div className="mb-8 flex flex-col items-center gap-1.5 lg:hidden">
					<div className="flex items-center gap-2 text-foreground">
						<BrandMark className="text-primary" />
						<h1 className="text-xl font-bold tracking-tight">MallHub</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						{m.auth_brand_tagline()}
					</p>
				</div>

				<div className="w-full max-w-md">{children}</div>
			</div>
		</div>
	);
}
