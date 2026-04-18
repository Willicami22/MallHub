import {
	LockPasswordIcon,
	Mail01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Field,
	FieldError,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@mallhub/ui';
import type { FormEvent } from 'react';
import type { TanStackZodError } from '@/features/.server/trpc/trpc.init';
import {
	ADMIN_PLATFORM_CREATABLE_USER_ROLES,
	type AdminPlatformCreatableUserRole,
} from '@/features/admin-platform/users/admin-users-policy.lib';
import {
	CREATE_USER_FORM_OPTIONS,
	toCreateUserSubmitData,
	useCreateUserForm,
} from '@/features/admin-platform/users/components/create-user.form';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

type CreateUserDialogProps = {
	trigger: React.ReactNode;
	onSubmit: (data: {
		name: string;
		email: string;
		password: string;
		role: AdminPlatformCreatableUserRole;
	}) => Promise<void>;
	isSubmitting: boolean;
	fieldErrors?: TanStackZodError | null;
};

const ROLE_OPTIONS = [
	{ value: appRoles.ADMIN_CC, label: () => m.admin_users_role_admin_cc() },
] as const;

type CreateUserRole = (typeof ROLE_OPTIONS)[number]['value'];

const isCreateUserRole = (value: string): value is CreateUserRole =>
	ADMIN_PLATFORM_CREATABLE_USER_ROLES.some((role) => role === value);

const toCreateUserRole = (
	value: string | null,
	fallbackRole: CreateUserRole,
): CreateUserRole => {
	if (!value) {
		return fallbackRole;
	}

	return isCreateUserRole(value) ? value : fallbackRole;
};

const mergeFieldErrors = (
	clientErrors: Array<{ message?: string } | undefined>,
	serverError: { message: string } | undefined,
) => (serverError ? [...clientErrors, serverError] : clientErrors);

export function CreateUserDialog({
	trigger,
	onSubmit,
	isSubmitting,
	fieldErrors,
}: CreateUserDialogProps) {
	const createUserForm = useCreateUserForm({
		...CREATE_USER_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toCreateUserSubmitData(value);
			if (!submitData) {
				return;
			}

			await onSubmit(submitData);
			formApi.reset();
		},
	});

	const roleItems = ROLE_OPTIONS.map((opt) => ({
		value: opt.value,
		label: opt.label(),
	}));

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void createUserForm.handleSubmit();
	};

	return (
		<createUserForm.Subscribe
			selector={(state) => state.values.formControls.open}
		>
			{(open) => (
				<Dialog
					open={open}
					onOpenChange={(nextOpen) => {
						if (nextOpen) {
							createUserForm.setFieldValue('formControls.open', true);
							return;
						}

						createUserForm.reset();
					}}
				>
					<DialogTrigger render={trigger as React.ReactElement} />
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>{m.admin_users_create_title()}</DialogTitle>
							<DialogDescription>
								{m.admin_users_create_description()}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-5">
							<createUserForm.Field name="name">
								{(nameField) => {
									const serverError = fieldErrors?.name;
									const isInvalid =
										Boolean(serverError) ||
										(nameField.state.meta.isTouched &&
											!nameField.state.meta.isValid);

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-user-name">
												{m.admin_users_create_name_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={UserIcon} />
												</InputGroupAddon>
												<InputGroupInput
													id="create-user-name"
													value={nameField.state.value}
													onChange={(event) =>
														nameField.handleChange(event.target.value)
													}
													onBlur={nameField.handleBlur}
													placeholder={m.admin_users_create_name_placeholder()}
													aria-invalid={isInvalid}
													required
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError
												errors={mergeFieldErrors(
													nameField.state.meta.errors,
													serverError,
												)}
											/>
										</Field>
									);
								}}
							</createUserForm.Field>

							<createUserForm.Field name="email">
								{(emailField) => {
									const serverError = fieldErrors?.email;
									const isInvalid =
										Boolean(serverError) ||
										(emailField.state.meta.isTouched &&
											!emailField.state.meta.isValid);

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-user-email">
												{m.admin_users_create_email_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={Mail01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id="create-user-email"
													type="email"
													value={emailField.state.value}
													onChange={(event) =>
														emailField.handleChange(event.target.value)
													}
													onBlur={emailField.handleBlur}
													placeholder={m.admin_users_create_email_placeholder()}
													aria-invalid={isInvalid}
													required
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError
												errors={mergeFieldErrors(
													emailField.state.meta.errors,
													serverError,
												)}
											/>
										</Field>
									);
								}}
							</createUserForm.Field>

							<createUserForm.Field name="password">
								{(passwordField) => {
									const serverError = fieldErrors?.password;
									const isInvalid =
										Boolean(serverError) ||
										(passwordField.state.meta.isTouched &&
											!passwordField.state.meta.isValid);

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-user-password">
												{m.admin_users_create_password_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={LockPasswordIcon} />
												</InputGroupAddon>
												<InputGroupInput
													id="create-user-password"
													type="password"
													value={passwordField.state.value}
													onChange={(event) =>
														passwordField.handleChange(event.target.value)
													}
													onBlur={passwordField.handleBlur}
													placeholder={m.admin_users_create_password_placeholder()}
													aria-invalid={isInvalid}
													required
													minLength={8}
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError
												errors={mergeFieldErrors(
													passwordField.state.meta.errors,
													serverError,
												)}
											/>
										</Field>
									);
								}}
							</createUserForm.Field>

							<createUserForm.Field name="role">
								{(roleField) => {
									const isInvalid =
										roleField.state.meta.isTouched &&
										!roleField.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												{m.admin_users_create_role_label()}
											</FieldLabel>
											<Select
												items={roleItems}
												value={roleField.state.value}
												onValueChange={(value) =>
													roleField.handleChange(
														toCreateUserRole(value, appRoles.ADMIN_CC),
													)
												}
												disabled={isSubmitting}
											>
												<SelectTrigger
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{ROLE_OPTIONS.map((opt) => (
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
							</createUserForm.Field>

							<DialogFooter>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<Spinner />
											{m.admin_users_create_submitting()}
										</>
									) : (
										m.admin_users_create_submit()
									)}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</createUserForm.Subscribe>
	);
}
