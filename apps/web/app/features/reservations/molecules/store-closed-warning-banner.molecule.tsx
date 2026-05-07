import { Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert, AlertDescription, AlertTitle } from '@mallhub/ui';

export function StoreClosedWarningBannerMolecule({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<Alert>
			<HugeiconsIcon icon={Clock01Icon} />
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>{description}</AlertDescription>
		</Alert>
	);
}
