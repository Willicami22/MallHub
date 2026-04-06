import {
	QrCode01Icon,
	Store02Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import * as m from '@/paraglide/messages.js';

/** 45° diagonal field + dot grid (upper-right) + radial lines from bottom-right
 *  + top-left atmospheric glow + centered orbital rings */
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
					id="auth-diagonal"
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
				<pattern
					id="auth-dots"
					width="20"
					height="20"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="2" cy="2" r="0.8" fill="currentColor" opacity="0.18" />
				</pattern>
			</defs>

			{/* Full-panel diagonal field */}
			<rect width="100%" height="100%" fill="url(#auth-diagonal)" />

			{/* Dense dot cluster — upper-right quadrant */}
			<rect x="55%" y="0" width="45%" height="40%" fill="url(#auth-dots)" />

			{/* Atmospheric glow — top-left corner */}
			<circle cx="0" cy="0" r="280" fill="currentColor" opacity="0.06" />

			{/* Centered orbital rings — gentle depth */}
			<circle
				cx="50%"
				cy="52%"
				r="310"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.8"
				opacity="0.05"
			/>
			<circle
				cx="50%"
				cy="52%"
				r="220"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.8"
				opacity="0.07"
			/>
			<circle
				cx="50%"
				cy="52%"
				r="140"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.6"
				opacity="0.09"
			/>

			{/* Radial lines from bottom-right corner */}
			<line
				x1="100%"
				y1="100%"
				x2="-10%"
				y2="55%"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.07"
			/>
			<line
				x1="100%"
				y1="100%"
				x2="25%"
				y2="-5%"
				stroke="currentColor"
				strokeWidth="0.7"
				opacity="0.06"
			/>
			<line
				x1="100%"
				y1="100%"
				x2="65%"
				y2="-5%"
				stroke="currentColor"
				strokeWidth="0.6"
				opacity="0.05"
			/>

			{/* Strong horizontal accent rule at 18% */}
			<line
				x1="0"
				y1="18%"
				x2="100%"
				y2="18%"
				stroke="currentColor"
				strokeWidth="0.6"
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

const FEATURE_NUMBERS = ['01', '02', '03'] as const;

export function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh">
			<div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-[45%]">
				<AuthBgSvg />

				{/* Ghosted letterforms — atmospheric depth layer */}
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

				<div className="relative z-10 flex h-full flex-col justify-between px-12 py-10 text-primary-foreground">
					<div className="flex items-center gap-2.5">
						<BrandMark />
						<span className="text-xs font-semibold tracking-widest uppercase opacity-75">
							MallHub
						</span>
					</div>

					<div className="space-y-10">
						<div className="space-y-4">
							{/* Eyebrow with horizontal line accent */}
							<div className="flex items-center gap-3">
								<div className="h-px w-6 bg-current opacity-35" />
								<p className="text-xs font-medium tracking-widest uppercase opacity-50">
									{m.auth_brand_eyebrow()}
								</p>
							</div>

							<h2 className="text-6xl font-bold leading-[1.05] tracking-tight">
								{m.auth_brand_headline_1()}
								<br />
								{m.auth_brand_headline_2()}
								<br />
								<span className="inline-block rounded-xl bg-primary-foreground/15 px-3 pb-1 opacity-90">
									{m.auth_brand_headline_3()}
								</span>
							</h2>

							{/* Full-width rule with dot accent */}
							<div className="flex items-center gap-2.5 pt-1">
								<div className="h-px flex-1 bg-current opacity-15" />
								<div className="size-1 rounded-full bg-current opacity-30" />
								<div className="h-px w-8 bg-current opacity-15" />
							</div>
						</div>

						{/* Features: horizontal 3-column catalogue grid */}
						<div className="grid grid-cols-3 gap-4">
							{features.map((feature, index) => (
								<div key={feature.getTitle()} className="space-y-3">
									<p className="text-2xs font-bold tracking-widest uppercase opacity-30">
										{FEATURE_NUMBERS[index]}
									</p>
									<div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-current/10">
										<HugeiconsIcon
											icon={feature.icon}
											className="size-4"
											strokeWidth={1.5}
										/>
									</div>
									<div>
										<p className="text-xs font-semibold uppercase tracking-wide leading-snug opacity-90">
											{feature.getTitle()}
										</p>
										<p className="mt-1 text-xs leading-relaxed opacity-40">
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
