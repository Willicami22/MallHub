import { Separator } from '@mallhub/ui';
import { Link } from 'react-router';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

function BrandMark() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 22 22"
			fill="none"
			aria-hidden="true"
			className="text-primary"
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

// TODO-MOCK: Replace with real data
const footerLinks = [
	{ getMessage: m.landing_footer_privacy, href: '#' },
	{ getMessage: m.landing_footer_terms, href: '#' },
	{ getMessage: m.landing_footer_contact, href: '#' },
] as const;

export function LandingFooter() {
	return (
		<footer className="border-t bg-background">
			<div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
				<div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
					<div className="space-y-3">
						<Link to={localizeHref('/')} className="flex items-center gap-2">
							<BrandMark />
							<span className="text-base font-bold tracking-tight text-foreground">
								MallHub
							</span>
						</Link>
						<p className="text-sm text-muted-foreground">
							{m.landing_footer_tagline()}
						</p>
					</div>

					<nav className="flex flex-wrap gap-6">
						{footerLinks.map((link) => (
							<a
								key={link.getMessage()}
								href={link.href}
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								{link.getMessage()}
							</a>
						))}
					</nav>
				</div>

				<Separator className="my-8" />

				<p className="text-xs text-muted-foreground">
					{m.landing_footer_copyright()}
				</p>
			</div>
		</footer>
	);
}
