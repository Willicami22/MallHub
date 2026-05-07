import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@mallhub/ui';
import { Link } from 'react-router';

export function CustomerReservationDetailTemplate({
	title,
	description,
	backHref,
	backLabel,
	children,
}: {
	title: string;
	description: string;
	backHref: string;
	backLabel: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
			<div className="mb-4">
				<Button
					variant="ghost"
					size="sm"
					nativeButton={false}
					render={<Link to={backHref} />}
					className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
					{backLabel}
				</Button>
			</div>
			<div className="mb-6">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			{children}
		</div>
	);
}
