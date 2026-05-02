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
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Spinner,
} from '@mallhub/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import {
	type StoreLocalLoginValues,
	storeLocalLoginSchema,
} from '@/features/store-admin-local/auth/schemas/auth.schemas';
import { authService } from '@/features/store-admin-local/auth/services/auth.service';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import { localizeHref } from '@/paraglide/runtime.js';

type StoreLocalLoginFormProps = {
	onSuccess?: () => void;
};

export function StoreLocalLoginForm({ onSuccess }: StoreLocalLoginFormProps) {
	const navigate = useNavigate();
	const [formError, setFormError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<StoreLocalLoginValues>({
		resolver: zodResolver(storeLocalLoginSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setFormError(null);
		try {
			await authService.signInWithEmailPassword(values, {
				callbackPath: '/store-local/dashboard',
			});
			onSuccess?.();
			navigate(localizeHref('/store-local/dashboard'));
		} catch (error) {
			if (isServiceError(error)) {
				setFormError(error.message);
				return;
			}
			setFormError('No se pudo iniciar sesión. Intenta de nuevo.');
		}
	});

	return (
		<form className="space-y-5" onSubmit={onSubmit}>
			<FieldGroup>
				<Field data-invalid={Boolean(form.formState.errors.email)}>
					<FieldLabel htmlFor="store-local-email">Correo</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={Mail01Icon} />
						</InputGroupAddon>
						<InputGroupInput
							id="store-local-email"
							autoComplete="email"
							placeholder="tu@email.com"
							aria-invalid={Boolean(form.formState.errors.email)}
							disabled={form.formState.isSubmitting}
							{...form.register('email')}
						/>
					</InputGroup>
					<FieldError>{form.formState.errors.email?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.password)}>
					<FieldLabel htmlFor="store-local-password">Contraseña</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={LockPasswordIcon} />
						</InputGroupAddon>
						<InputGroupInput
							id="store-local-password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="current-password"
							aria-invalid={Boolean(form.formState.errors.password)}
							disabled={form.formState.isSubmitting}
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
			</FieldGroup>

			{formError ? (
				<p className="text-sm text-destructive" role="alert">
					{formError}
				</p>
			) : null}

			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting ? (
					<>
						<Spinner />
						Entrando…
					</>
				) : (
					'Entrar al panel de tienda'
				)}
			</Button>
		</form>
	);
}
