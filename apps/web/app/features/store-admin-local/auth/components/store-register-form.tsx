import { zodResolver } from '@hookform/resolvers/zod';
import { Mail01Icon } from '@hugeicons/core-free-icons';
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
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
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
	const mallsQuery = useQuery(trpc.browse.listMalls.queryOptions({}));
	const registerStore = useMutation(
		trpc.storeRegistrations.create.mutationOptions({
			onSuccess: () => {
				toast.success('Solicitud enviada. Queda pendiente de aprobación.');
				navigate(localizeHref('/store-local/login'));
			},
		}),
	);

	const form = useForm<RegisterStoreFormValues>({
		resolver: zodResolver(registerStoreSchema),
		defaultValues: {
			mallId: '',
			storeName: '',
			category: '',
			mail: '',
			contactPhone: '',
			description: '',
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			const payload: RegisterStorePayload = {
				mallId: values.mallId,
				storeName: values.storeName,
				category: values.category,
				mail: values.mail,
				contactPhone: values.contactPhone,
				description: values.description?.trim() || undefined,
			};
			await registerStore.mutateAsync(payload);
		} catch {
			// TanStack Query expone `registerStore.error` en el siguiente render.
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
								disabled={registerStore.isPending || mallsQuery.isLoading}
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
						disabled={registerStore.isPending}
						{...form.register('storeName')}
					/>
					<FieldError>{form.formState.errors.storeName?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.category)}>
					<FieldLabel htmlFor="reg-category">Categoría</FieldLabel>
					<Input
						id="reg-category"
						placeholder="Moda, tecnología, hogar..."
						disabled={registerStore.isPending}
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
							disabled={registerStore.isPending}
							{...form.register('mail')}
						/>
					</InputGroup>
					<FieldError>{form.formState.errors.mail?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.contactPhone)}>
					<FieldLabel htmlFor="reg-contact-phone">Teléfono</FieldLabel>
					<Input
						id="reg-contact-phone"
						autoComplete="tel"
						disabled={registerStore.isPending}
						{...form.register('contactPhone')}
					/>
					<FieldError>{form.formState.errors.contactPhone?.message}</FieldError>
				</Field>

				<Field data-invalid={Boolean(form.formState.errors.description)}>
					<FieldLabel htmlFor="reg-description">Descripción</FieldLabel>
					<Textarea
						id="reg-description"
						rows={4}
						disabled={registerStore.isPending}
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

			{mallsQuery.isError ? (
				<p className="text-sm text-destructive" role="alert">
					No se pudieron cargar los malls disponibles.
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
