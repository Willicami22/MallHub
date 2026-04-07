import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldLabel,
	Input,
	Spinner,
} from '@mallhub/ui';
import { useState } from 'react';
import * as m from '@/paraglide/messages.js';

type BanUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userName: string;
	onConfirm: (reason: string) => Promise<void>;
	isSubmitting: boolean;
};

export function BanUserDialog({
	open,
	onOpenChange,
	userName,
	onConfirm,
	isSubmitting,
}: BanUserDialogProps) {
	const [reason, setReason] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onConfirm(reason);
		setReason('');
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				onOpenChange(nextOpen);
				if (!nextOpen) setReason('');
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{m.admin_users_ban_title()}</DialogTitle>
					<DialogDescription>
						{m.admin_users_ban_description({ name: userName })}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-5">
					<Field>
						<FieldLabel htmlFor="ban-reason">
							{m.admin_users_ban_reason_label()}
						</FieldLabel>
						<Input
							id="ban-reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={m.admin_users_ban_reason_placeholder()}
						/>
					</Field>
					<DialogFooter>
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							{m.admin_users_cancel()}
						</Button>
						<Button type="submit" variant="destructive" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.admin_users_ban_confirm()}
								</>
							) : (
								m.admin_users_ban_confirm()
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
