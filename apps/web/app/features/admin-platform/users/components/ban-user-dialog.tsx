import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldError,
	FieldLabel,
	Input,
	Spinner,
} from '@mallhub/ui';
import type { FormEvent } from 'react';
import {
	BAN_USER_FORM_OPTIONS,
	toBanUserSubmitData,
	useBanUserForm,
} from '@/features/admin-platform/users/components/ban-user.form';
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
	const banUserForm = useBanUserForm({
		...BAN_USER_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toBanUserSubmitData(value);
			if (!submitData) {
				return;
			}

			await onConfirm(submitData.reason);
			formApi.reset();
		},
	});

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void banUserForm.handleSubmit();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				onOpenChange(nextOpen);
				if (!nextOpen) {
					banUserForm.reset();
				}
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
					<banUserForm.Field name="reason">
						{(reasonField) => {
							const isInvalid =
								reasonField.state.meta.isTouched &&
								!reasonField.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="ban-reason">
										{m.admin_users_ban_reason_label()}
									</FieldLabel>
									<Input
										id="ban-reason"
										value={reasonField.state.value}
										onChange={(event) =>
											reasonField.handleChange(event.target.value)
										}
										onBlur={reasonField.handleBlur}
										placeholder={m.admin_users_ban_reason_placeholder()}
										aria-invalid={isInvalid}
										disabled={isSubmitting}
									/>
									<FieldError errors={reasonField.state.meta.errors} />
								</Field>
							);
						}}
					</banUserForm.Field>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{m.admin_users_cancel()}
						</Button>
						<Button type="submit" variant="destructive" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.admin_users_ban_confirming()}
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
