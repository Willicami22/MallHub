import { zodResolver } from '@hookform/resolvers/zod';
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
	Spinner,
} from '@mallhub/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePasswordResetRequest } from '@/features/store-admin-local/auth/hooks/use-password-reset-request';
import {
	type ForgotPasswordFormValues,
	forgotPasswordSchema,
} from '@/features/store-admin-local/auth/schemas/auth.schemas';

export function ForgotPasswordForm() {
	const [done, setDone] = useState(false);
	const resetRequest = usePasswordResetRequest();

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = form.handleSubmit(async (values) => {
		await resetRequest.mutateAsync(values);
		setDone(true);
	});

	if (done) {
		return (
			<p className="text-sm text-muted-foreground">
				Si el correo existe, recibirás instrucciones en breve (simulación).
				También puedes usar el flujo global de recuperación de la plataforma.
			</p>
		);
	}

	return (
		<form className="space-y-5" onSubmit={onSubmit}>
			<FieldGroup>
				<Field data-invalid={Boolean(form.formState.errors.email)}>
					<FieldLabel htmlFor="forgot-email">Correo</FieldLabel>
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<HugeiconsIcon icon={Mail01Icon} />
						</InputGroupAddon>
						<InputGroupInput
							id="forgot-email"
							type="email"
							autoComplete="email"
							aria-invalid={Boolean(form.formState.errors.email)}
							disabled={resetRequest.isPending}
							{...form.register('email')}
						/>
					</InputGroup>
					<FieldError>{form.formState.errors.email?.message}</FieldError>
				</Field>
			</FieldGroup>

			<Button
				type="submit"
				size="lg"
				className="w-full"
				disabled={resetRequest.isPending}
			>
				{resetRequest.isPending ? (
					<>
						<Spinner />
						Enviando…
					</>
				) : (
					'Enviar enlace'
				)}
			</Button>
		</form>
	);
}
