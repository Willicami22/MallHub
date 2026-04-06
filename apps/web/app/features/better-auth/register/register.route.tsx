import {
	LockPasswordIcon,
	Mail01Icon,
	SmartPhone01Icon,
	UserIcon,
	ViewIcon,
	ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Separator,
	Spinner,
	toast,
} from '@mallhub/ui';
import { useMutation } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { type FormEvent, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import {
	REGISTER_FORM_OPTIONS,
	toRegisterSubmitData,
	useRegisterForm,
	withRegisterForm,
} from '@/features/better-auth/register/register.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import {
	hasFieldErrors,
	pickFieldErrors,
} from '@/features/trpc/trpc-form-error.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/register.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.register_meta_title() },
	{ name: 'description', content: m.register_meta_description() },
];

const REGISTER_ERROR_FIELDS = ['name', 'email', 'password'] as const;

const RegisterFormWithOptions = withRegisterForm({
	...REGISTER_FORM_OPTIONS,
	render: function RegisterForm({ form: registerForm }) {
		const handleSubmit = useCallback(
			(event: FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				registerForm.handleSubmit();
			},
			[registerForm],
		);

		return (
			<registerForm.Subscribe selector={(store) => store.isSubmitting}>
				{(isSubmitting) => (
					<form className="space-y-5" onSubmit={handleSubmit}>
						<FieldGroup>
							<registerForm.Field name="name">
								{(nameField) => {
									const isInvalid =
										nameField.state.meta.isTouched &&
										!nameField.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={nameField.name}>
												{m.register_name_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={UserIcon} />
												</InputGroupAddon>
												<InputGroupInput
													id={nameField.name}
													name={nameField.name}
													type="text"
													placeholder={m.register_name_placeholder()}
													value={nameField.state.value}
													onChange={(event) =>
														nameField.handleChange(event.target.value)
													}
													onBlur={nameField.handleBlur}
													aria-invalid={isInvalid}
													autoComplete="name"
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError errors={nameField.state.meta.errors} />
										</Field>
									);
								}}
							</registerForm.Field>

							<registerForm.Field name="email">
								{(emailField) => {
									const isInvalid =
										emailField.state.meta.isTouched &&
										!emailField.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={emailField.name}>
												{m.register_email_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={Mail01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={emailField.name}
													name={emailField.name}
													type="email"
													placeholder={m.register_email_placeholder()}
													value={emailField.state.value}
													onChange={(event) =>
														emailField.handleChange(event.target.value)
													}
													onBlur={emailField.handleBlur}
													aria-invalid={isInvalid}
													autoComplete="email"
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError errors={emailField.state.meta.errors} />
										</Field>
									);
								}}
							</registerForm.Field>

							<registerForm.Field name="phone">
								{(phoneField) => {
									const isInvalid =
										phoneField.state.meta.isTouched &&
										!phoneField.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={phoneField.name}>
												{m.register_phone_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={SmartPhone01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={phoneField.name}
													name={phoneField.name}
													type="tel"
													placeholder={m.register_phone_placeholder()}
													value={phoneField.state.value}
													onChange={(event) =>
														phoneField.handleChange(event.target.value)
													}
													onBlur={phoneField.handleBlur}
													aria-invalid={isInvalid}
													autoComplete="tel"
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError errors={phoneField.state.meta.errors} />
										</Field>
									);
								}}
							</registerForm.Field>

							<registerForm.Field name="formControls.showPassword">
								{(showPasswordField) => (
									<registerForm.Field name="password">
										{(passwordField) => {
											const isInvalid =
												passwordField.state.meta.isTouched &&
												!passwordField.state.meta.isValid;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={passwordField.name}>
														{m.register_password_label()}
													</FieldLabel>
													<InputGroup>
														<InputGroupAddon align="inline-start">
															<HugeiconsIcon icon={LockPasswordIcon} />
														</InputGroupAddon>
														<InputGroupInput
															id={passwordField.name}
															name={passwordField.name}
															type={
																showPasswordField.state.value
																	? 'text'
																	: 'password'
															}
															placeholder={m.register_password_placeholder()}
															value={passwordField.state.value}
															onChange={(event) =>
																passwordField.handleChange(event.target.value)
															}
															onBlur={passwordField.handleBlur}
															aria-invalid={isInvalid}
															autoComplete="new-password"
															disabled={isSubmitting}
														/>
														<InputGroupAddon align="inline-end">
															<InputGroupButton
																aria-label={m.auth_toggle_password()}
																onClick={() =>
																	showPasswordField.handleChange(
																		!showPasswordField.state.value,
																	)
																}
															>
																<HugeiconsIcon
																	icon={
																		showPasswordField.state.value
																			? ViewOffSlashIcon
																			: ViewIcon
																	}
																/>
															</InputGroupButton>
														</InputGroupAddon>
													</InputGroup>
													<FieldError
														errors={passwordField.state.meta.errors}
													/>
												</Field>
											);
										}}
									</registerForm.Field>
								)}
							</registerForm.Field>

							<registerForm.Field name="formControls.showConfirmPassword">
								{(showConfirmPasswordField) => (
									<registerForm.Field name="confirmPassword">
										{(confirmPasswordField) => {
											const isInvalid =
												confirmPasswordField.state.meta.isTouched &&
												!confirmPasswordField.state.meta.isValid;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={confirmPasswordField.name}>
														{m.register_confirm_password_label()}
													</FieldLabel>
													<InputGroup>
														<InputGroupAddon align="inline-start">
															<HugeiconsIcon icon={LockPasswordIcon} />
														</InputGroupAddon>
														<InputGroupInput
															id={confirmPasswordField.name}
															name={confirmPasswordField.name}
															type={
																showConfirmPasswordField.state.value
																	? 'text'
																	: 'password'
															}
															placeholder={m.register_confirm_password_placeholder()}
															value={confirmPasswordField.state.value}
															onChange={(event) =>
																confirmPasswordField.handleChange(
																	event.target.value,
																)
															}
															onBlur={confirmPasswordField.handleBlur}
															aria-invalid={isInvalid}
															autoComplete="new-password"
															disabled={isSubmitting}
														/>
														<InputGroupAddon align="inline-end">
															<InputGroupButton
																aria-label={m.auth_toggle_password()}
																onClick={() =>
																	showConfirmPasswordField.handleChange(
																		!showConfirmPasswordField.state.value,
																	)
																}
															>
																<HugeiconsIcon
																	icon={
																		showConfirmPasswordField.state.value
																			? ViewOffSlashIcon
																			: ViewIcon
																	}
																/>
															</InputGroupButton>
														</InputGroupAddon>
													</InputGroup>
													<FieldError
														errors={confirmPasswordField.state.meta.errors}
													/>
												</Field>
											);
										}}
									</registerForm.Field>
								)}
							</registerForm.Field>
						</FieldGroup>

						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.register_submitting()}
								</>
							) : (
								m.register_submit()
							)}
						</Button>
					</form>
				)}
			</registerForm.Subscribe>
		);
	},
});

export default function RegisterRoute() {
	const navigate = useNavigate();
	const session = useAppSession();
	const trpc = useTRPC();
	const registerMutation = useMutation(trpc.auth.signUpEmail.mutationOptions());
	const registerForm = useRegisterForm({
		...REGISTER_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toRegisterSubmitData(value);
			if (!submitData) {
				return;
			}

			try {
				await registerMutation.mutateAsync({
					name: submitData.name,
					email: submitData.email,
					password: submitData.password,
					phone: submitData.phone || undefined,
				});
				toast.success(m.register_success_toast());
				navigate(localizeHref('/'));
			} catch (error) {
				if (error instanceof TRPCClientError) {
					const fields = pickFieldErrors(
						error.data?.zodError,
						REGISTER_ERROR_FIELDS,
					);

					if (hasFieldErrors(fields)) {
						formApi.setErrorMap({
							onSubmit: {
								fields,
							},
						});
						return;
					}

					toast.error(
						m.register_failed_toast({
							message: error.data?.message ?? m.auth_unexpected_error(),
						}),
					);
					return;
				}

				toast.error(
					m.register_failed_toast({
						message: m.auth_unexpected_error(),
					}),
				);
			}
		},
	});

	if (session.data) {
		return (
			<AuthLayout>
				<div className="space-y-6 text-center">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.login_session_active_title()}
						</h2>
						<p className="text-sm text-muted-foreground">
							{session.data.user.email}
						</p>
					</div>
					<Button size="lg" render={<Link to={localizeHref('/')} />}>
						{m.login_go_home()}
					</Button>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-3xl font-bold tracking-tight text-foreground">
						{m.register_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.register_description()}
					</p>
				</div>

				<Separator />

				<RegisterFormWithOptions form={registerForm} />

				<p className="text-center text-sm text-muted-foreground">
					{m.register_have_account()}{' '}
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0"
						render={<Link to={localizeHref('/auth/login')} />}
					>
						{m.register_sign_in()}
					</Button>
				</p>
			</div>
		</AuthLayout>
	);
}
