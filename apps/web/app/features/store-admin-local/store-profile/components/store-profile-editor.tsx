import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Field,
	FieldError,
	FieldLabel,
	Input,
	Spinner,
	Textarea,
} from '@mallhub/ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Store } from '@/features/store-admin-local/shared/types/domain.models';
import {
	type StoreProfileFormValues,
	storeProfileFormSchema,
} from '@/features/store-admin-local/store-profile/schemas/store-profile.schemas';

type StoreProfileEditorProps = {
	store: Store | null | undefined;
	onSave: (values: StoreProfileFormValues) => Promise<void>;
	isSaving: boolean;
};

export function StoreProfileEditor({
	store,
	onSave,
	isSaving,
}: StoreProfileEditorProps) {
	const form = useForm<StoreProfileFormValues>({
		resolver: zodResolver(storeProfileFormSchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
		},
	});

	useEffect(() => {
		if (!store) {
			return;
		}
		form.reset({
			name: store.name,
			slug: store.slug,
			description: store.description ?? '',
		});
	}, [store, form]);

	const onSubmit = form.handleSubmit(async (values) => {
		await onSave(values);
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Perfil de tienda</CardTitle>
				<CardDescription className="text-sm">
					Datos públicos y slug. Incluye <code className="text-xs">error@</code>{' '}
					en el nombre para probar el manejo de errores simulado.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={onSubmit}>
					<Field data-invalid={Boolean(form.formState.errors.name)}>
						<FieldLabel>Nombre</FieldLabel>
						<Input {...form.register('name')} disabled={!store} />
						<FieldError>{form.formState.errors.name?.message}</FieldError>
					</Field>
					<Field data-invalid={Boolean(form.formState.errors.slug)}>
						<FieldLabel>Slug</FieldLabel>
						<Input {...form.register('slug')} disabled={!store} />
						<FieldError>{form.formState.errors.slug?.message}</FieldError>
					</Field>
					<Field>
						<FieldLabel>Descripción</FieldLabel>
						<Textarea
							rows={4}
							{...form.register('description')}
							disabled={!store}
						/>
					</Field>
					<Button type="submit" disabled={isSaving || !store}>
						{isSaving ? (
							<>
								<Spinner />
								Guardando…
							</>
						) : (
							'Guardar cambios'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
