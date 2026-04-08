import { cn } from '@mallhub/ui';

export function BrandMark({ className }: { className?: string }) {
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

export function BrandLogo({ className }: { className?: string }) {
	return (
		<div className={cn('flex items-center gap-2 text-foreground', className)}>
			<BrandMark className="text-primary" />
			<span className="text-base font-bold tracking-tight">MallHub</span>
		</div>
	);
}
