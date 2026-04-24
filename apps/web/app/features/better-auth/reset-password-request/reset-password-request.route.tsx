import { Mail01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Separator,
	Spinner,
	toast,
} from '@mallhub/ui';
import { useMutation } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { type FormEvent, useCallback, useState } from 'react';
import { Link } from 'react-router';
import { loadGuestOnlyAuthRoute } from '@/features/.server/auth/auth-route-guard.lib';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import {
	RESET_PASSWORD_REQUEST_FORM_OPTIONS,
	toResetPasswordRequestSubmitData,
	useResetPasswordRequestForm,
	withResetPasswordRequestForm,
} from '@/features/better-auth/reset-password-request/reset-password-request.form';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import {
	hasFieldErrors,
	pickFieldErrors,
} from '@/features/trpc/trpc-form-error.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/reset-password-request.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.reset_password_request_meta_title() },
	{
		name: 'description',
		content: m.reset_password_request_meta_description(),
	},
];

export const loader = async ({ request }: Route.LoaderArgs) =>
	loadGuestOnlyAuthRoute(request);

const REQUEST_PASSWORD_RESET_ERROR_FIELDS = ['email'] as const;

const ResetPasswordRequestFormWithOptions = withResetPasswordRequestForm({
	...RESET_PASSWORD_REQUEST_FORM_OPTIONS,
	render: function ResetPasswordRequestForm({
		form: resetPasswordRequestForm,
	}) {
		const handleSubmit = useCallback(
			(event: FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				resetPasswordRequestForm.handleSubmit();
			},
			[resetPasswordRequestForm],
		);

		return (
			<resetPasswordRequestForm.Subscribe
				selector={(store) => store.isSubmitting}
			>
				{(isSubmitting) => (
					<form className="space-y-5" onSubmit={handleSubmit}>
						<FieldGroup>
							<resetPasswordRequestForm.Field name="email">
								{(emailField) => {
									const isInvalid =
										emailField.state.meta.isTouched &&
										!emailField.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={emailField.name}>
												{m.reset_password_request_email_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={Mail01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={emailField.name}
													name={emailField.name}
													type="email"
													placeholder={m.reset_password_request_email_placeholder()}
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
							</resetPasswordRequestForm.Field>
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
									{m.reset_password_request_submitting()}
								</>
							) : (
								m.reset_password_request_submit()
							)}
						</Button>
					</form>
				)}
			</resetPasswordRequestForm.Subscribe>
		);
	},
});

export default function ResetPasswordRequestRoute({
	loaderData,
}: Route.ComponentProps) {
	const trpc = useTRPC();
	const [requestSubmitted, setRequestSubmitted] = useState(false);
	const requestPasswordResetMutation = useMutation(
		trpc.auth.requestPasswordReset.mutationOptions(),
	);
	const loginHref = withReturnTo(
		localizeHref('/auth/login'),
		loaderData.returnTo,
	);
	const resetPasswordRequestForm = useResetPasswordRequestForm({
		...RESET_PASSWORD_REQUEST_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toResetPasswordRequestSubmitData(value);
			if (!submitData) {
				return;
			}

			try {
				await requestPasswordResetMutation.mutateAsync({
					email: submitData.email,
				});
				setRequestSubmitted(true);
				formApi.reset();
				toast.success(m.reset_password_request_success_toast());
			} catch (error) {
				if (error instanceof TRPCClientError) {
					const fields = pickFieldErrors(
						error.data?.zodError,
						REQUEST_PASSWORD_RESET_ERROR_FIELDS,
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
						m.reset_password_request_error_toast({
							message: error.data?.message ?? m.auth_unexpected_error(),
						}),
					);
					return;
				}

				toast.error(
					m.reset_password_request_error_toast({
						message: m.auth_unexpected_error(),
					}),
				);
			}
		},
	});

	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.reset_password_request_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.reset_password_request_description()}
					</p>
				</div>

				<Separator />

				{requestSubmitted ? (
					<div className="space-y-4">
						<p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
							{m.reset_password_request_success_description()}
						</p>
						<Button
							size="lg"
							className="w-full"
							nativeButton={false}
							render={<Link to={loginHref} />}
						>
							{m.reset_password_request_back_to_login()}
						</Button>
					</div>
				) : (
					<ResetPasswordRequestFormWithOptions
						form={resetPasswordRequestForm}
					/>
				)}
			</div>
		</AuthLayout>
	);
}
