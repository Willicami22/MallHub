import { zodResolver } from '@hookform/resolvers/zod';
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
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import {
	type RegisterStoreFormValues,
	registerStoreSchema,
} from '@/features/store-admin-local/auth/schemas/auth.schemas';
import type { RegisterStorePayload } from '@/features/store-admin-local/auth/types';
import { useTRPC } from '@/features/trpc/trpc.context';
import { localizeHref } from '@/paraglide/runtime.js';

export function StoreRegisterForm() {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const session = useAppSession();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const mallsQuery = useQuery(trpc.browse.listMalls.queryOptions({}));
	const signUpMutation = useMutation(trpc.auth.signUpEmail.mutationOptions());
	const registerStore = useMutation(
		trpc.storeRegistrations.create.mutationOptions({
			onSuccess: () => {
				toast.success('Solicitud enviada. Queda pendiente de aprobación.');
				navigate(localizeHref('/store-local/login'));
			},
		}),
	);
	const isSubmitting = registerStore.isPending || signUpMutation.isPending;

	const form = useForm<RegisterStoreFormValues>({
		resolver: zodResolver(registerStoreSchema),
		defaultValues: {
			mallId: '',
			storeName: '',
			category: '',
			mail: '',
			password: '',
			confirmPassword: '',
			contactPhone: '',
			description: '',
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			if (!session.data?.user) {
				await signUpMutation.mutateAsync({
					name: values.storeName,
					email: values.mail,
					password: values.password,
				});
			}

			const payload: RegisterStorePayload = {
				mallId: values.mallId,
				storeName: values.storeName,
				category: values.category,
				mail: values.mail,
				contactPhone: values.contactPhone,
				description: values.description?.trim() || undefined,
			};
			await registerStore.mutateAsync(payload);
		} catch (error) {
			if (error instanceof TRPCClientError) {
				toast.error(error.message);
			}
		}
	});

	const malls = mallsQuery.data?.malls ?? [];

	return (
		<form className="space-y-5" onSubmit={onSubmit}>
			<FieldGroup>
				<Field data-invalid={Boolean(form.formState.errors.mallId)}>
					<FieldLabel>Mall</FieldLabel>
					<Controller
						control={form.control}
						name="mallId"
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={isSubmitting || mallsQuery.isLoading}
							>
								<SelectTrigger
									className="w-full"
									aria-invalid={Boolean(form.formState.errors.mallId)}
								>
									<SelectValue placeholder="Selecciona un mall" />
								</SelectTrigger>
								<SelectContent>
									{malls.length === 0 ? (
										<SelectItem value="" disabled>
											No hay malls disponibles
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
						)}
					/>
					<FieldError>{form.formState.errors.mallId?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.storeName)}>
					<FieldLabel htmlFor="reg-store-name">Nombre de la tienda</FieldLabel>
					<Input
						id="reg-store-name"
						disabled={isSubmitting}
						{...form.register('storeName')}
					/>
					<FieldError>{form.formState.errors.storeName?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.category)}>
					<FieldLabel htmlFor="reg-category">Categoría</FieldLabel>
					<Input
						id="reg-category"
						placeholder="Moda, tecnología, hogar..."
						disabled={isSubmitting}
						{...form.register('category')}
					/>
					<FieldError>{form.formState.errors.category?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.mail)}>
					<FieldLabel htmlFor="reg-mail">Correo</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={Mail01Icon} />
						</InputGroupAddon>
						<InputGroupInput
							id="reg-mail"
							type="email"
							autoComplete="email"
							aria-invalid={Boolean(form.formState.errors.mail)}
							disabled={isSubmitting}
							{...form.register('mail')}
						/>
					</InputGroup>
					<FieldError>{form.formState.errors.mail?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.password)}>
					<FieldLabel htmlFor="reg-password">Contraseña</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={LockPasswordIcon} />
						</InputGroupAddon>
						<InputGroupInput
							id="reg-password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="new-password"
							aria-invalid={Boolean(form.formState.errors.password)}
							disabled={isSubmitting}
							{...form.register('password')}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								aria-label="Mostrar u ocultar contrasena"
								onClick={() => setShowPassword((prev) => !prev)}
							>
								<HugeiconsIcon
									icon={showPassword ? ViewOffSlashIcon : ViewIcon}
								/>
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
					<FieldError>{form.formState.errors.password?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.confirmPassword)}>
					<FieldLabel htmlFor="reg-confirm">Confirmar contraseña</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={LockPasswordIcon} />
						</InputGroupAddon>
						<InputGroupInput
							id="reg-confirm"
							type={showConfirmPassword ? 'text' : 'password'}
							autoComplete="new-password"
							aria-invalid={Boolean(form.formState.errors.confirmPassword)}
							disabled={isSubmitting}
							{...form.register('confirmPassword')}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								aria-label="Mostrar u ocultar contrasena"
								onClick={() => setShowConfirmPassword((prev) => !prev)}
							>
								<HugeiconsIcon
									icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
								/>
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
					<FieldError>
						{form.formState.errors.confirmPassword?.message}
					</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.contactPhone)}>
					<FieldLabel htmlFor="reg-contact-phone">Teléfono</FieldLabel>
					<Input
						id="reg-contact-phone"
						autoComplete="tel"
						disabled={isSubmitting}
						{...form.register('contactPhone')}
					/>
					<FieldError>{form.formState.errors.contactPhone?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.description)}>
					<FieldLabel htmlFor="reg-description">Descripción</FieldLabel>
					<Textarea
						id="reg-description"
						rows={4}
						disabled={isSubmitting}
						{...form.register('description')}
					/>
					<FieldError>{form.formState.errors.description?.message}</FieldError>
				</Field>
			</FieldGroup>

			{registerStore.error ? (
				<p className="text-sm text-destructive" role="alert">
					{registerStore.error.message}
				</p>
			) : null}

			{signUpMutation.error ? (
				<p className="text-sm text-destructive" role="alert">
					{signUpMutation.error.message}
				</p>
			) : null}

			{mallsQuery.isError ? (
				<p className="text-sm text-destructive" role="alert">
					No se pudieron cargar los malls disponibles.
				</p>
			) : null}

			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Spinner />
						Creando tienda…
					</>
				) : (
					'Registrar tienda'
				)}
			</Button>
		</form>
	);
}
