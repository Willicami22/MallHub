import {
	LockPasswordIcon,
	Mail01Icon,
	SmartPhone01Icon,
	Store02Icon,
	Tag01Icon,
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Spinner,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { type FormEvent, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
	STORE_REGISTER_FORM_OPTIONS,
	toStoreRegisterSubmitData,
	useStoreRegisterForm,
} from '@/features/store-admin-local/auth/store-register.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import {
	hasFieldErrors,
	pickFieldErrors,
} from '@/features/trpc/trpc-form-error.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

const REGISTER_ERROR_FIELDS = ['mail', 'password'] as const;

export function StoreRegisterForm() {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const mallsQuery = useQuery(trpc.browse.listMalls.queryOptions({}));
	const createWithAccount = useMutation(
		trpc.storeRegistrations.createWithAccount.mutationOptions(),
	);
	const malls = mallsQuery.data?.malls ?? [];

	const storeRegisterForm = useStoreRegisterForm({
		...STORE_REGISTER_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toStoreRegisterSubmitData(value);
			if (!submitData) return;

			try {
				await createWithAccount.mutateAsync({
					mallId: submitData.mallId,
					storeName: submitData.storeName,
					category: submitData.category,
					mail: submitData.mail,
					password: submitData.password,
					contactPhone: submitData.contactPhone,
					description: submitData.description.trim() || undefined,
				});

				toast.success(m.store_register_success_toast());
				navigate(localizeHref('/store-local/pending'));
			} catch (error) {
				if (error instanceof TRPCClientError) {
					const fields = pickFieldErrors(
						error.data?.zodError,
						REGISTER_ERROR_FIELDS,
					);
					if (hasFieldErrors(fields)) {
						formApi.setErrorMap({ onSubmit: { fields } });
						return;
					}
					toast.error(
						m.store_register_failed_toast({
							message: error.data?.message ?? m.auth_unexpected_error(),
						}),
					);
				}
			}
		},
	});

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			storeRegisterForm.handleSubmit();
		},
		[storeRegisterForm],
	);

	return (
		<>
			<storeRegisterForm.Subscribe selector={(store) => store.isSubmitting}>
				{(isSubmitting) => (
					<form className="space-y-6" onSubmit={handleSubmit}>
						<FieldGroup>
							<storeRegisterForm.Field name="mallId">
								{(mallIdField) => {
									const isInvalid =
										mallIdField.state.meta.isTouched &&
										!mallIdField.state.meta.isValid;
									const selectedMall = mallIdField.state.value
										? malls.find((m) => m.id === mallIdField.state.value)
										: null;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>{m.store_register_mall_label()}</FieldLabel>
											<Select
												value={mallIdField.state.value}
												onValueChange={(val) =>
													mallIdField.handleChange(val ?? '')
												}
												disabled={isSubmitting || mallsQuery.isLoading}
											>
												<SelectTrigger
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue
														placeholder={m.store_register_mall_placeholder()}
													>
														{selectedMall && (
															<>
																{selectedMall.name} · {selectedMall.city}
															</>
														)}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{malls.length === 0 ? (
														<SelectItem value="" disabled>
															{m.store_register_mall_no_options()}
														</SelectItem>
													) : (
														malls.map((mall) => (
															<SelectItem key={mall.id} value={mall.id}>
																{mall.name} · {mall.city}
															</SelectItem>
														))
													)}
												</SelectContent>
											</Select>
											<FieldError errors={mallIdField.state.meta.errors} />
										</Field>
									);
								}}
							</storeRegisterForm.Field>

							<storeRegisterForm.Field name="storeName">
								{(storeNameField) => {
									const isInvalid =
										storeNameField.state.meta.isTouched &&
										!storeNameField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={storeNameField.name}>
												{m.store_register_store_name_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={Store02Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={storeNameField.name}
													name={storeNameField.name}
													type="text"
													value={storeNameField.state.value}
													onChange={(e) =>
														storeNameField.handleChange(e.target.value)
													}
													onBlur={storeNameField.handleBlur}
													aria-invalid={isInvalid}
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError errors={storeNameField.state.meta.errors} />
										</Field>
									);
								}}
							</storeRegisterForm.Field>

							<storeRegisterForm.Field name="category">
								{(categoryField) => {
									const isInvalid =
										categoryField.state.meta.isTouched &&
										!categoryField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={categoryField.name}>
												{m.store_register_category_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={Tag01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={categoryField.name}
													name={categoryField.name}
													type="text"
													placeholder={m.store_register_category_placeholder()}
													value={categoryField.state.value}
													onChange={(e) =>
														categoryField.handleChange(e.target.value)
													}
													onBlur={categoryField.handleBlur}
													aria-invalid={isInvalid}
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError errors={categoryField.state.meta.errors} />
										</Field>
									);
								}}
							</storeRegisterForm.Field>

							<storeRegisterForm.Field name="contactPhone">
								{(phoneField) => {
									const isInvalid =
										phoneField.state.meta.isTouched &&
										!phoneField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={phoneField.name}>
												{m.store_register_phone_label()}
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<HugeiconsIcon icon={SmartPhone01Icon} />
												</InputGroupAddon>
												<InputGroupInput
													id={phoneField.name}
													name={phoneField.name}
													type="tel"
													autoComplete="tel"
													value={phoneField.state.value}
													onChange={(e) =>
														phoneField.handleChange(e.target.value)
													}
													onBlur={phoneField.handleBlur}
													aria-invalid={isInvalid}
													disabled={isSubmitting}
												/>
											</InputGroup>
											<FieldError errors={phoneField.state.meta.errors} />
										</Field>
									);
								}}
							</storeRegisterForm.Field>

							<storeRegisterForm.Field name="description">
								{(descriptionField) => {
									const isInvalid =
										descriptionField.state.meta.isTouched &&
										!descriptionField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={descriptionField.name}>
												{m.store_register_description_label()}
											</FieldLabel>
											<Textarea
												id={descriptionField.name}
												name={descriptionField.name}
												rows={3}
												value={descriptionField.state.value}
												onChange={(e) =>
													descriptionField.handleChange(e.target.value)
												}
												onBlur={descriptionField.handleBlur}
												aria-invalid={isInvalid}
												disabled={isSubmitting}
											/>
											<FieldError errors={descriptionField.state.meta.errors} />
										</Field>
									);
								}}
							</storeRegisterForm.Field>
						</FieldGroup>

						<div className="space-y-4">
							<div className="space-y-1">
								<p className="text-sm font-medium text-foreground">
									{m.store_register_account_section()}
								</p>
								<p className="text-xs text-muted-foreground">
									{m.store_register_account_section_hint()}
								</p>
							</div>
							<Separator />
							<FieldGroup>
								<storeRegisterForm.Field name="mail">
									{(mailField) => {
										const isInvalid =
											mailField.state.meta.isTouched &&
											!mailField.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={mailField.name}>
													{m.register_email_label()}
												</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<HugeiconsIcon icon={Mail01Icon} />
													</InputGroupAddon>
													<InputGroupInput
														id={mailField.name}
														name={mailField.name}
														type="email"
														autoComplete="email"
														value={mailField.state.value}
														onChange={(e) =>
															mailField.handleChange(e.target.value)
														}
														onBlur={mailField.handleBlur}
														aria-invalid={isInvalid}
														disabled={isSubmitting}
													/>
												</InputGroup>
												<FieldError errors={mailField.state.meta.errors} />
											</Field>
										);
									}}
								</storeRegisterForm.Field>

								<storeRegisterForm.Field name="formControls.showPassword">
									{(showPasswordField) => (
										<storeRegisterForm.Field name="password">
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
																autoComplete="new-password"
																value={passwordField.state.value}
																onChange={(e) =>
																	passwordField.handleChange(e.target.value)
																}
																onBlur={passwordField.handleBlur}
																aria-invalid={isInvalid}
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
										</storeRegisterForm.Field>
									)}
								</storeRegisterForm.Field>

								<storeRegisterForm.Field name="formControls.showConfirmPassword">
									{(showConfirmPasswordField) => (
										<storeRegisterForm.Field name="confirmPassword">
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
																autoComplete="new-password"
																value={confirmPasswordField.state.value}
																onChange={(e) =>
																	confirmPasswordField.handleChange(
																		e.target.value,
																	)
																}
																onBlur={confirmPasswordField.handleBlur}
																aria-invalid={isInvalid}
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
										</storeRegisterForm.Field>
									)}
								</storeRegisterForm.Field>
							</FieldGroup>
						</div>

						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.store_register_submitting()}
								</>
							) : (
								m.store_register_submit()
							)}
						</Button>
					</form>
				)}
			</storeRegisterForm.Subscribe>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				{m.store_register_have_account()}{' '}
				<Button
					variant="link"
					size="sm"
					className="h-auto p-0"
					nativeButton={false}
					render={<Link to={localizeHref('/auth/login')} />}
				>
					{m.store_register_sign_in()}
				</Button>
			</p>
		</>
	);
}
