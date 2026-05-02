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
	Spinner,
} from '@mallhub/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useRegisterStore } from '@/features/store-admin-local/auth/hooks/use-register-store';
import {
	type RegisterStoreFormValues,
	registerStoreSchema,
} from '@/features/store-admin-local/auth/schemas/auth.schemas';
import { localizeHref } from '@/paraglide/runtime.js';

export function StoreRegisterForm() {
	const navigate = useNavigate();
	const registerStore = useRegisterStore();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<RegisterStoreFormValues>({
		resolver: zodResolver(registerStoreSchema),
		defaultValues: {
			storeName: '',
			slug: '',
			ownerEmail: '',
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			await registerStore.mutateAsync({
				storeName: values.storeName,
				slug: values.slug,
				ownerEmail: values.ownerEmail,
				password: values.password,
			});
			navigate(localizeHref('/store-local/login'));
		} catch {
			// Errores de red / simulación: TanStack Query expone `registerStore.error` en el siguiente render
		}
	});

	return (
		<form className="space-y-5" onSubmit={onSubmit}>
			<FieldGroup>
				<Field data-invalid={Boolean(form.formState.errors.storeName)}>
					<FieldLabel htmlFor="reg-store-name">Nombre de la tienda</FieldLabel>
					<Input
						id="reg-store-name"
						disabled={registerStore.isPending}
						{...form.register('storeName')}
					/>
					<FieldError>{form.formState.errors.storeName?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.slug)}>
					<FieldLabel htmlFor="reg-slug">Slug público</FieldLabel>
					<Input
						id="reg-slug"
						placeholder="mi-boutique"
						disabled={registerStore.isPending}
						{...form.register('slug')}
					/>
					<FieldError>{form.formState.errors.slug?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.ownerEmail)}>
					<FieldLabel htmlFor="reg-owner-email">
						Correo del responsable
					</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={Mail01Icon} />
						</InputGroupAddon>
						<InputGroupInput
							id="reg-owner-email"
							type="email"
							autoComplete="email"
							aria-invalid={Boolean(form.formState.errors.ownerEmail)}
							disabled={registerStore.isPending}
							{...form.register('ownerEmail')}
						/>
					</InputGroup>
					<FieldError>{form.formState.errors.ownerEmail?.message}</FieldError>
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
							disabled={registerStore.isPending}
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
							disabled={registerStore.isPending}
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
			</FieldGroup>

			{registerStore.error ? (
				<p className="text-sm text-destructive" role="alert">
					{registerStore.error.message}
				</p>
			) : null}

			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={registerStore.isPending}
			>
				{registerStore.isPending ? (
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
