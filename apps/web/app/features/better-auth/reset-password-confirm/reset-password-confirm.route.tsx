import {
	LockPasswordIcon,
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
import { type FormEvent, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { loadGuestOnlyAuthRoute } from '@/features/.server/auth/auth-route-guard.lib';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import {
	RESET_PASSWORD_CONFIRM_FORM_OPTIONS,
	toResetPasswordConfirmSubmitData,
	useResetPasswordConfirmForm,
	withResetPasswordConfirmForm,
} from '@/features/better-auth/reset-password-confirm/reset-password-confirm.form';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import {
	hasFieldErrors,
	pickFieldErrors,
} from '@/features/trpc/trpc-form-error.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/reset-password-confirm.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.reset_password_confirm_meta_title() },
	{
		name: 'description',
		content: m.reset_password_confirm_meta_description(),
	},
];

export const loader = async ({ request }: Route.LoaderArgs) =>
	loadGuestOnlyAuthRoute(request);

const RESET_PASSWORD_CONFIRM_ERROR_FIELDS = [
	'newPassword',
	'confirmPassword',
	'token',
] as const;

const ResetPasswordConfirmFormWithOptions = withResetPasswordConfirmForm({
	...RESET_PASSWORD_CONFIRM_FORM_OPTIONS,
	render: function ResetPasswordConfirmForm({
		form: resetPasswordConfirmForm,
	}) {
		const handleSubmit = useCallback(
			(event: FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				resetPasswordConfirmForm.handleSubmit();
			},
			[resetPasswordConfirmForm],
		);

		return (
			<resetPasswordConfirmForm.Subscribe
				selector={(store) => store.isSubmitting}
			>
				{(isSubmitting) => (
					<form className="space-y-5" onSubmit={handleSubmit}>
						<FieldGroup>
							<resetPasswordConfirmForm.Field name="formControls.showNewPassword">
								{(showNewPasswordField) => (
									<resetPasswordConfirmForm.Field name="newPassword">
										{(newPasswordField) => {
											const isInvalid =
												newPasswordField.state.meta.isTouched &&
												!newPasswordField.state.meta.isValid;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={newPasswordField.name}>
														{m.reset_password_confirm_new_password_label()}
													</FieldLabel>
													<InputGroup>
														<InputGroupAddon align="inline-start">
															<HugeiconsIcon icon={LockPasswordIcon} />
														</InputGroupAddon>
														<InputGroupInput
															id={newPasswordField.name}
															name={newPasswordField.name}
															type={
																showNewPasswordField.state.value
																	? 'text'
																	: 'password'
															}
															placeholder={m.reset_password_confirm_new_password_placeholder()}
															value={newPasswordField.state.value}
															onChange={(event) =>
																newPasswordField.handleChange(
																	event.target.value,
																)
															}
															onBlur={newPasswordField.handleBlur}
															aria-invalid={isInvalid}
															autoComplete="new-password"
															disabled={isSubmitting}
														/>
														<InputGroupAddon align="inline-end">
															<InputGroupButton
																aria-label={m.auth_toggle_password()}
																onClick={() =>
																	showNewPasswordField.handleChange(
																		!showNewPasswordField.state.value,
																	)
																}
															>
																<HugeiconsIcon
																	icon={
																		showNewPasswordField.state.value
																			? ViewOffSlashIcon
																			: ViewIcon
																	}
																/>
															</InputGroupButton>
														</InputGroupAddon>
													</InputGroup>
													<FieldError
														errors={newPasswordField.state.meta.errors}
													/>
												</Field>
											);
										}}
									</resetPasswordConfirmForm.Field>
								)}
							</resetPasswordConfirmForm.Field>

							<resetPasswordConfirmForm.Field name="formControls.showConfirmPassword">
								{(showConfirmPasswordField) => (
									<resetPasswordConfirmForm.Field name="confirmPassword">
										{(confirmPasswordField) => {
											const isInvalid =
												confirmPasswordField.state.meta.isTouched &&
												!confirmPasswordField.state.meta.isValid;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={confirmPasswordField.name}>
														{m.reset_password_confirm_confirm_password_label()}
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
															placeholder={m.reset_password_confirm_confirm_password_placeholder()}
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
									</resetPasswordConfirmForm.Field>
								)}
							</resetPasswordConfirmForm.Field>
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
									{m.reset_password_confirm_submitting()}
								</>
							) : (
								m.reset_password_confirm_submit()
							)}
						</Button>
					</form>
				)}
			</resetPasswordConfirmForm.Subscribe>
		);
	},
});

export default function ResetPasswordConfirmRoute({
	loaderData,
}: Route.ComponentProps) {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [tokenError, setTokenError] = useState<string | null>(null);
	const resetPasswordMutation = useMutation(
		trpc.auth.resetPassword.mutationOptions(),
	);
	const requestNewLinkHref = localizeHref('/auth/reset-password');
	const loginHref = withReturnTo(
		localizeHref('/auth/login'),
		loaderData.returnTo,
	);

	const token = searchParams.get('token');
	const callbackError = searchParams.get('error');

	const hasValidTokenInQuery = useMemo(
		() => typeof token === 'string' && token.length > 0,
		[token],
	);

	const hasInvalidTokenState =
		callbackError === 'INVALID_TOKEN' || !hasValidTokenInQuery || !!tokenError;

	const resetPasswordConfirmForm = useResetPasswordConfirmForm({
		...RESET_PASSWORD_CONFIRM_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toResetPasswordConfirmSubmitData(value);
			if (!submitData) {
				return;
			}

			if (!hasValidTokenInQuery || !token) {
				setTokenError(m.auth_reset_password_invalid_token());
				return;
			}

			try {
				await resetPasswordMutation.mutateAsync({
					token,
					newPassword: submitData.newPassword,
				});
				toast.success(m.reset_password_confirm_success_toast());
				navigate(localizeHref('/auth/login'));
			} catch (error) {
				if (error instanceof TRPCClientError) {
					const fields = pickFieldErrors(
						error.data?.zodError,
						RESET_PASSWORD_CONFIRM_ERROR_FIELDS,
					);

					if (fields.token?.message) {
						setTokenError(fields.token.message);
						return;
					}

					if (hasFieldErrors(fields)) {
						formApi.setErrorMap({
							onSubmit: {
								fields: {
									newPassword: fields.newPassword,
									confirmPassword: fields.confirmPassword,
								},
							},
						});
						return;
					}

					toast.error(
						m.reset_password_confirm_error_toast({
							message: error.data?.message ?? m.auth_unexpected_error(),
						}),
					);
					return;
				}

				toast.error(
					m.reset_password_confirm_error_toast({
						message: m.auth_unexpected_error(),
					}),
				);
			}
		},
	});

	return (
		<AuthLayout>
			<div className="space-y-6">
				{hasInvalidTokenState ? (
					<>
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold tracking-tight text-foreground">
								{m.reset_password_confirm_invalid_title()}
							</h2>
							<p className="text-sm text-muted-foreground">
								{tokenError ?? m.reset_password_confirm_invalid_description()}
							</p>
						</div>

						<Separator />

						<div className="space-y-3">
							<Button
								size="lg"
								className="w-full"
								nativeButton={false}
								render={<Link to={requestNewLinkHref} />}
							>
								{m.reset_password_confirm_request_new_link()}
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="w-full"
								nativeButton={false}
								render={<Link to={loginHref} />}
							>
								{m.reset_password_confirm_back_to_login()}
							</Button>
						</div>
					</>
				) : (
					<>
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold tracking-tight text-foreground">
								{m.reset_password_confirm_title()}
							</h2>
							<p className="text-sm text-muted-foreground">
								{m.reset_password_confirm_description()}
							</p>
						</div>

						<Separator />

						<ResetPasswordConfirmFormWithOptions
							form={resetPasswordConfirmForm}
						/>
					</>
				)}
			</div>
		</AuthLayout>
	);
}
