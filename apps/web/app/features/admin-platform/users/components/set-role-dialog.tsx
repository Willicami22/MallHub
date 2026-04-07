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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@mallhub/ui';
import type { FormEvent } from 'react';
import type { UserRole } from '@/features/.server/prisma/generated/client';
import {
	getSetRoleFormDefaultValues,
	SET_ROLE_FORM_OPTIONS,
	toSetRoleSubmitData,
	useSetRoleForm,
} from '@/features/admin-platform/users/components/set-role.form';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

type SetRoleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userName: string;
	currentRole: UserRole;
	onConfirm: (role: UserRole) => Promise<void>;
	isSubmitting: boolean;
};

const ALL_ROLES = [
	{ value: appRoles.CUSTOMER, label: () => m.admin_users_role_customer() },
	{
		value: appRoles.ADMIN_LOCAL,
		label: () => m.admin_users_role_admin_local(),
	},
	{ value: appRoles.ADMIN_CC, label: () => m.admin_users_role_admin_cc() },
	{
		value: appRoles.ADMIN_PLATFORM,
		label: () => m.admin_users_role_admin_platform(),
	},
] as const;

const isUserRole = (value: string): value is UserRole =>
	value === appRoles.CUSTOMER ||
	value === appRoles.ADMIN_LOCAL ||
	value === appRoles.ADMIN_CC ||
	value === appRoles.ADMIN_PLATFORM;

const toUserRole = (value: string | null, fallbackRole: UserRole): UserRole => {
	if (!value) {
		return fallbackRole;
	}

	return isUserRole(value) ? value : fallbackRole;
};

function SetRoleDialogContent({
	open,
	onOpenChange,
	userName,
	currentRole,
	onConfirm,
	isSubmitting,
}: SetRoleDialogProps) {
	const setRoleForm = useSetRoleForm({
		...SET_ROLE_FORM_OPTIONS,
		defaultValues: getSetRoleFormDefaultValues(currentRole),
		onSubmit: async ({ value, formApi }) => {
			const submitData = toSetRoleSubmitData(value);
			if (!submitData) {
				return;
			}

			await onConfirm(submitData.role);
			formApi.reset();
		},
	});

	const roleItems = ALL_ROLES.map((opt) => ({
		value: opt.value,
		label: opt.label(),
	}));

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void setRoleForm.handleSubmit();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				onOpenChange(nextOpen);
				if (!nextOpen) {
					setRoleForm.reset();
				}
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{m.admin_users_set_role_title()}</DialogTitle>
					<DialogDescription>
						{m.admin_users_set_role_description({ name: userName })}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-5">
					<setRoleForm.Field name="role">
						{(roleField) => {
							const isInvalid =
								roleField.state.meta.isTouched && !roleField.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>{m.admin_users_set_role_label()}</FieldLabel>
									<Select
										items={roleItems}
										value={roleField.state.value}
										onValueChange={(value) =>
											roleField.handleChange(toUserRole(value, currentRole))
										}
										disabled={isSubmitting}
									>
										<SelectTrigger className="w-full" aria-invalid={isInvalid}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{ALL_ROLES.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={roleField.state.meta.errors} />
								</Field>
							);
						}}
					</setRoleForm.Field>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{m.admin_users_cancel()}
						</Button>
						<setRoleForm.Subscribe
							selector={(state) => [
								state.values.role,
								state.values.formControls.initialRole,
							]}
						>
							{([selectedRole, initialRole]) => (
								<Button
									type="submit"
									disabled={isSubmitting || selectedRole === initialRole}
								>
									{isSubmitting ? (
										<>
											<Spinner />
											{m.admin_users_set_role_confirming()}
										</>
									) : (
										m.admin_users_set_role_confirm()
									)}
								</Button>
							)}
						</setRoleForm.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function SetRoleDialog(props: SetRoleDialogProps) {
	return (
		<SetRoleDialogContent
			key={`${props.open}-${props.userName}-${props.currentRole}`}
			{...props}
		/>
	);
}
