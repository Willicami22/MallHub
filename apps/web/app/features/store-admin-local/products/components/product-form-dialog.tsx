import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldError,
	FieldLabel,
	Input,
	Spinner,
} from '@mallhub/ui';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
	type ProductFormValues,
	productFormSchema,
} from '@/features/store-admin-local/products/schemas/product.schemas';
import type { ProductUpsertDto } from '@/features/store-admin-local/products/services/product.service';
import type { Product } from '@/features/store-admin-local/shared/types/domain.models';

type ProductFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	storeId: string;
	initial: Product | null;
	onSubmit: (dto: ProductUpsertDto) => Promise<void>;
	isSubmitting: boolean;
};

const emptyVariant = (): ProductFormValues['variants'][number] => ({
	sku: '',
	label: '',
	priceCents: 0,
	stock: 0,
});

export function ProductFormDialog({
	open,
	onOpenChange,
	storeId,
	initial,
	onSubmit,
	isSubmitting,
}: ProductFormDialogProps) {
	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			name: '',
			description: '',
			basePriceCents: 0,
			isPublished: true,
			variants: [emptyVariant()],
		},
	});

	const variants = useFieldArray({ control: form.control, name: 'variants' });

	useEffect(() => {
		if (!open) {
			return;
		}
		if (initial) {
			form.reset({
				name: initial.name,
				description: initial.description ?? '',
				basePriceCents: initial.basePriceCents,
				isPublished: initial.isPublished,
				variants:
					initial.variants.length > 0
						? initial.variants.map((variant) => ({
								id: variant.id,
								sku: variant.sku,
								label: variant.label,
								priceCents: variant.priceCents,
								stock: variant.stock,
							}))
						: [emptyVariant()],
			});
			return;
		}
		form.reset({
			name: '',
			description: '',
			basePriceCents: 0,
			isPublished: true,
			variants: [emptyVariant()],
		});
	}, [open, initial, form]);

	const handleSubmit = form.handleSubmit(async (values) => {
		const dto: ProductUpsertDto = {
			id: initial?.id,
			storeId,
			name: values.name,
			description: values.description?.trim()
				? values.description.trim()
				: null,
			basePriceCents: values.basePriceCents,
			isPublished: values.isPublished,
			variants: values.variants.map((variant) => ({
				id: variant.id,
				sku: variant.sku,
				label: variant.label,
				priceCents: variant.priceCents,
				stock: variant.stock,
			})),
		};
		await onSubmit(dto);
		onOpenChange(false);
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{initial ? 'Editar producto' : 'Nuevo producto'}
					</DialogTitle>
				</DialogHeader>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<Field data-invalid={Boolean(form.formState.errors.name)}>
						<FieldLabel>Nombre</FieldLabel>
						<Input {...form.register('name')} />
						<FieldError>{form.formState.errors.name?.message}</FieldError>
					</Field>

					<Field>
						<FieldLabel>Descripción</FieldLabel>
						<Input {...form.register('description')} />
					</Field>

					<Field data-invalid={Boolean(form.formState.errors.basePriceCents)}>
						<FieldLabel>Precio base (céntimos)</FieldLabel>
						<Input
							type="number"
							{...form.register('basePriceCents', { valueAsNumber: true })}
						/>
						<FieldError>
							{form.formState.errors.basePriceCents?.message}
						</FieldError>
					</Field>

					<Field className="flex flex-row items-center gap-2">
						<Checkbox
							checked={form.watch('isPublished')}
							onCheckedChange={(checked) =>
								form.setValue('isPublished', checked === true)
							}
						/>
						<FieldLabel className="font-normal">Publicado</FieldLabel>
					</Field>

					<div className="space-y-3 rounded-lg border p-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Variantes</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => variants.append(emptyVariant())}
							>
								Añadir variante
							</Button>
						</div>
						<FieldError>{form.formState.errors.variants?.message}</FieldError>
						{variants.fields.map((field, index) => (
							<div
								key={field.id}
								className="grid gap-2 rounded-md border border-dashed p-2 sm:grid-cols-2"
							>
								<Field>
									<FieldLabel>SKU</FieldLabel>
									<Input {...form.register(`variants.${index}.sku`)} />
								</Field>
								<Field>
									<FieldLabel>Etiqueta</FieldLabel>
									<Input {...form.register(`variants.${index}.label`)} />
								</Field>
								<Field>
									<FieldLabel>Precio (¢)</FieldLabel>
									<Input
										type="number"
										{...form.register(`variants.${index}.priceCents`, {
											valueAsNumber: true,
										})}
									/>
								</Field>
								<Field>
									<FieldLabel>Stock</FieldLabel>
									<Input
										type="number"
										{...form.register(`variants.${index}.stock`, {
											valueAsNumber: true,
										})}
									/>
								</Field>
								{variants.fields.length > 1 ? (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="sm:col-span-2"
										onClick={() => variants.remove(index)}
									>
										Quitar variante
									</Button>
								) : null}
							</div>
						))}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner />
									Guardando…
								</>
							) : (
								'Guardar'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
