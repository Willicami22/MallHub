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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
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

const emptyImage = (): ProductFormValues['images'][number] => ({ url: '' });

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
			category: '',
			description: '',
			basePriceCents: 0,
			priceDiscountCents: 0,
			status: 'draft',
			isReservable: true,
			images: [emptyImage()],
			isPublished: false,
			variants: [emptyVariant()],
		},
	});

	const variants = useFieldArray({ control: form.control, name: 'variants' });
	const images = useFieldArray({ control: form.control, name: 'images' });

	useEffect(() => {
		if (!open) {
			return;
		}
		if (initial) {
			form.reset({
				name: initial.name,
				category: initial.category ?? '',
				description: initial.description ?? '',
				basePriceCents: initial.basePriceCents,
				priceDiscountCents: initial.priceDiscountCents ?? 0,
				status: initial.status,
				isReservable: initial.isReservable,
				isPublished: initial.status === 'active',
				images:
					initial.images.length > 0
						? initial.images.map((url) => ({ url }))
						: [emptyImage()],
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
			category: '',
			description: '',
			basePriceCents: 0,
			priceDiscountCents: 0,
			status: 'draft',
			isReservable: true,
			isPublished: false,
			images: [emptyImage()],
			variants: [emptyVariant()],
		});
	}, [open, initial, form]);

	const handleSubmit = form.handleSubmit(async (values) => {
		const dto: ProductUpsertDto = {
			id: initial?.id,
			storeId,
			name: values.name,
			category: values.category?.trim() ? values.category.trim() : null,
			description: values.description?.trim()
				? values.description.trim()
				: null,
			basePriceCents: values.basePriceCents,
			priceDiscountCents:
				values.priceDiscountCents > 0 ? values.priceDiscountCents : null,
			status: values.status,
			isReservable: values.isReservable,
			images: values.images
				.map((image) => image.url.trim())
				.filter((url) => url.length > 0),
			isPublished: values.status === 'active',
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
						<FieldLabel>Categoría</FieldLabel>
						<Input
							placeholder="Ej. Accesorios, Calzado, Hogar"
							{...form.register('category')}
						/>
					</Field>

					<Field>
						<FieldLabel>Descripción</FieldLabel>
						<Input {...form.register('description')} />
					</Field>

					<Field data-invalid={Boolean(form.formState.errors.basePriceCents)}>
						<FieldLabel>Precio base (COP)</FieldLabel>
						<Input
							type="number"
							step={1}
							{...form.register('basePriceCents', { valueAsNumber: true })}
						/>
						<FieldError>
							{form.formState.errors.basePriceCents?.message}
						</FieldError>
					</Field>

					<Field>
						<FieldLabel>Precio de descuento (COP)</FieldLabel>
						<Input
							type="number"
							min={0}
							step={1}
							{...form.register('priceDiscountCents', {
								valueAsNumber: true,
							})}
						/>
					</Field>

					<Field>
						<FieldLabel>Estado</FieldLabel>
						<Select
							value={form.watch('status')}
							onValueChange={(value) =>
								form.setValue('status', value as ProductFormValues['status'])
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Borrador</SelectItem>
								<SelectItem value="active">Activo</SelectItem>
								<SelectItem value="inactive">Inactivo</SelectItem>
								<SelectItem value="archived">Archivado</SelectItem>
							</SelectContent>
						</Select>
					</Field>

					<Field className="flex flex-row items-center gap-2">
						<Checkbox
							checked={form.watch('isReservable')}
							onCheckedChange={(checked) =>
								form.setValue('isReservable', checked === true)
							}
						/>
						<FieldLabel className="font-normal">Disponible</FieldLabel>
					</Field>

					<div className="space-y-3 rounded-lg border p-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Imágenes</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => images.append(emptyImage())}
							>
								Añadir imagen
							</Button>
						</div>
						<FieldError>{form.formState.errors.images?.message}</FieldError>
						{images.fields.map((field, index) => (
							<div
								key={field.id}
								className="grid gap-2 rounded-md border border-dashed p-2 sm:grid-cols-[minmax(0,1fr)_auto]"
							>
								<Field>
									<FieldLabel>URL de imagen</FieldLabel>
									<Input {...form.register(`images.${index}.url`)} />
								</Field>
								<div className="flex items-end">
									{images.fields.length > 1 ? (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => images.remove(index)}
										>
											Quitar
										</Button>
									) : null}
								</div>
							</div>
						))}
					</div>

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
									<FieldLabel>Precio (COP)</FieldLabel>
									<Input
										type="number"
										step={1}
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
