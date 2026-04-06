import {
	LockPasswordIcon,
	Mail01Icon,
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
import { signOut } from '@/features/better-auth/better-auth-client.lib';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import {
	LOGIN_FORM_OPTIONS,
	toLoginSubmitData,
	useLoginForm,
	withLoginForm,
} from '@/features/better-auth/login/login.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import {
	hasFieldErrors,
	pickFieldErrors,
} from '@/features/trpc/trpc-form-error.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/login.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.login_meta_title() },
	{ name: 'description', content: m.login_meta_description() },
];

const LOGIN_ERROR_FIELDS = ['email', 'password'] as const;

const LoginFormWithOptions = withLoginForm({
	...LOGIN_FORM_OPTIONS,
	render: function LoginForm({ form: loginForm }) {
		const handleSubmit = useCallback(
			(event: FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				loginForm.handleSubmit();
			},
			[loginForm],
		);

		return (
			<loginForm.Subscribe selector={(store) => store.isSubmitting}>
				{(isSubmitting) => (
					<form className="space-y-5" onSubmit={handleSubmit}>
						<FieldGroup>
							<loginForm.Field name="email">
								{(emailField) => {
									const isInvalid =
										emailField.state.meta.isTouched &&
										!emailField.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={emailField.name}>
												{m.login_email_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={Mail01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={emailField.name}
													name={emailField.name}
													placeholder={m.login_email_placeholder()}
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
							</loginForm.Field>

							<loginForm.Field name="formControls.showPassword">
								{(showPasswordField) => (
									<loginForm.Field name="password">
										{(passwordField) => {
											const isInvalid =
												passwordField.state.meta.isTouched &&
												!passwordField.state.meta.isValid;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={passwordField.name}>
														{m.login_password_label()}
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
															placeholder={m.login_password_placeholder()}
															value={passwordField.state.value}
															onChange={(event) =>
																passwordField.handleChange(event.target.value)
															}
															onBlur={passwordField.handleBlur}
															aria-invalid={isInvalid}
															autoComplete="current-password"
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
									</loginForm.Field>
								)}
							</loginForm.Field>
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
									{m.login_submitting()}
								</>
							) : (
								m.login_submit()
							)}
						</Button>
					</form>
				)}
			</loginForm.Subscribe>
		);
	},
});

export default function LoginRoute() {
	const navigate = useNavigate();
	const session = useAppSession();
	const trpc = useTRPC();
	const loginMutation = useMutation(trpc.auth.signInEmail.mutationOptions());
	const loginForm = useLoginForm({
		...LOGIN_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toLoginSubmitData(value);
			if (!submitData) {
				return;
			}

			try {
				await loginMutation.mutateAsync(submitData);
				toast.success(m.login_success_toast());
				navigate(localizeHref('/'));
			} catch (error) {
				if (error instanceof TRPCClientError) {
					const fields = pickFieldErrors(
						error.data?.zodError,
						LOGIN_ERROR_FIELDS,
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
						m.login_failed_toast({
							message: error.data?.message ?? m.auth_unexpected_error(),
						}),
					);
					return;
				}

				toast.error(
					m.login_failed_toast({
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
					<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button size="lg" render={<Link to={localizeHref('/')} />}>
							{m.login_go_home()}
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={async () => {
								await signOut();
							}}
						>
							{m.login_sign_out()}
						</Button>
					</div>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.login_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.login_description()}
					</p>
				</div>

				<Separator />

				<LoginFormWithOptions form={loginForm} />

				<p className="text-center text-sm text-muted-foreground">
					{m.login_no_account()}{' '}
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0"
						render={<Link to={localizeHref('/auth/register')} />}
					>
						{m.login_create_account()}
					</Button>
				</p>
			</div>
		</AuthLayout>
	);
}
