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
} from '@mallhub/ui';
import { useForm } from 'react-hook-form';
import {
	type PromotionFormValues,
	promotionFormSchema,
} from '@/features/store-admin-local/store-profile/schemas/store-profile.schemas';

type PromotionCreateFormProps = {
	onCreate: (values: PromotionFormValues) => Promise<void>;
	isSubmitting: boolean;
};

export function PromotionCreateForm({
	onCreate,
	isSubmitting,
}: PromotionCreateFormProps) {
	const form = useForm<PromotionFormValues>({
		resolver: zodResolver(promotionFormSchema),
		defaultValues: {
			title: '',
			discountPercent: 10,
			startsAt: new Date().toISOString().slice(0, 16),
			endsAt: new Date(Date.now() + 604_800_000).toISOString().slice(0, 16),
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		await onCreate(values);
		form.reset({
			title: '',
			discountPercent: 10,
			startsAt: new Date().toISOString().slice(0, 16),
			endsAt: new Date(Date.now() + 604_800_000).toISOString().slice(0, 16),
		});
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Nueva promoción</CardTitle>
				<CardDescription className="text-sm">
					Validación con Zod (fechas coherentes, descuento acotado).
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={onSubmit}>
					<Field data-invalid={Boolean(form.formState.errors.title)}>
						<FieldLabel>Título</FieldLabel>
						<Input {...form.register('title')} />
						<FieldError>{form.formState.errors.title?.message}</FieldError>
					</Field>
					<Field data-invalid={Boolean(form.formState.errors.discountPercent)}>
						<FieldLabel>Descuento %</FieldLabel>
						<Input
							type="number"
							{...form.register('discountPercent', { valueAsNumber: true })}
						/>
						<FieldError>
							{form.formState.errors.discountPercent?.message}
						</FieldError>
					</Field>
					<Field data-invalid={Boolean(form.formState.errors.startsAt)}>
						<FieldLabel>Inicio</FieldLabel>
						<Input type="datetime-local" {...form.register('startsAt')} />
						<FieldError>{form.formState.errors.startsAt?.message}</FieldError>
					</Field>
					<Field data-invalid={Boolean(form.formState.errors.endsAt)}>
						<FieldLabel>Fin</FieldLabel>
						<Input type="datetime-local" {...form.register('endsAt')} />
						<FieldError>{form.formState.errors.endsAt?.message}</FieldError>
					</Field>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Spinner />
								Creando…
							</>
						) : (
							'Crear promoción'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
