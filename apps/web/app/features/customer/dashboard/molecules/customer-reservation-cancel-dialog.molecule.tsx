import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Spinner,
} from '@mallhub/ui';

export function CustomerReservationCancelDialogMolecule({
	open,
	onOpenChange,
	isSubmitting,
	title,
	description,
	confirmLabel,
	confirmingLabel,
	dismissLabel,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSubmitting: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	confirmingLabel: string;
	dismissLabel: string;
	onConfirm: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						{dismissLabel}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Spinner />
								{confirmingLabel}
							</>
						) : (
							confirmLabel
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
