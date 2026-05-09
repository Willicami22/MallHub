import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUploadIcon, PackageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
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
	Textarea,
	toast,
} from '@mallhub/ui';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
	type ProductFormValues,
	productFormSchema,
} from '@/features/store-admin-local/products/schemas/product.schemas';
import type { ProductUpsertDto } from '@/features/store-admin-local/products/services/product.service';
import type { Product } from '@/features/store-admin-local/shared/types/domain.models';

type ImageUploadMutation = {
	mutateAsync: (input: {
		storeId: string;
		contentType: string;
		size: number;
	}) => Promise<{ uploadUrl: string; publicUrl: string; key: string }>;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ProductFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	storeId: string;
	initial: Product | null;
	onSubmit: (dto: ProductUpsertDto) => Promise<void>;
	isSubmitting: boolean;
	getImageUploadUrlMutation?: ImageUploadMutation;
};

const emptyVariant = (): ProductFormValues['variants'][number] => ({
	sku: '',
	label: '',
	priceCents: 0,
	stock: 0,
});

const emptyImage = (): ProductFormValues['images'][number] => ({ url: '' });

function SectionHeader({
	title,
	description,
	action,
}: {
	title: string;
	description?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between border-b px-4 py-3">
			<div>
				<p className="text-sm font-semibold">{title}</p>
				{description ? (
					<p className="text-xs text-muted-foreground">{description}</p>
				) : null}
			</div>
			{action}
		</div>
	);
}

export function ProductFormDialog({
	open,
	onOpenChange,
	storeId,
	initial,
	onSubmit,
	isSubmitting,
	getImageUploadUrlMutation,
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
			variants: [],
		},
	});

	const variants = useFieldArray({ control: form.control, name: 'variants' });
	const images = useFieldArray({ control: form.control, name: 'images' });
	const imageInputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(
		null,
	);

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
				variants: initial.variants.map((variant) => ({
					id: variant.id,
					sku: variant.sku,
					label: variant.label,
					priceCents: variant.priceCents,
					stock: variant.stock,
				})),
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
			variants: [],
		});
	}, [open, initial, form]);

	const handleImageFileSelected = async (file: File, index: number) => {
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			toast.error('Formato no compatible. Use JPG, PNG o WebP.');
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			toast.error('El archivo supera el límite de 5 MB.');
			return;
		}
		if (!getImageUploadUrlMutation) {
			toast.error('Upload no disponible en este momento.');
			return;
		}

		setUploadingImageIndex(index);
		try {
			const { uploadUrl, publicUrl } =
				await getImageUploadUrlMutation.mutateAsync({
					storeId,
					contentType: file.type,
					size: file.size,
				});
			const res = await fetch(uploadUrl, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type },
			});
			if (!res.ok) throw new Error('upload failed');
			form.setValue(`images.${index}.url`, publicUrl, {
				shouldValidate: true,
			});
		} catch {
			toast.error('No se pudo subir la imagen.');
		} finally {
			setUploadingImageIndex(null);
		}
	};

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

	const watchedStatus = form.watch('status');
	const watchedIsReservable = form.watch('isReservable');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 border-b px-6 py-4">
					<DialogTitle className="text-lg">
						{initial ? 'Editar producto' : 'Nuevo producto'}
					</DialogTitle>
					{initial ? (
						<p className="text-sm text-muted-foreground">{initial.name}</p>
					) : (
						<p className="text-sm text-muted-foreground">
							Completa la información del producto para el catálogo.
						</p>
					)}
				</DialogHeader>

				<form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
						{/* ── Información básica ── */}
						<div className="overflow-hidden rounded-xl border">
							<SectionHeader title="Información básica" />
							<div className="space-y-4 p-4">
								<Field data-invalid={Boolean(form.formState.errors.name)}>
									<FieldLabel>Nombre del producto</FieldLabel>
									<Input
										placeholder="Ej. Zapatilla Running Gel"
										{...form.register('name')}
									/>
									<FieldError>{form.formState.errors.name?.message}</FieldError>
								</Field>

								<Field>
									<FieldLabel>
										Categoría{' '}
										<span className="text-xs text-muted-foreground font-normal">
											(opcional)
										</span>
									</FieldLabel>
									<Input
										placeholder="Ej. Accesorios, Calzado, Hogar"
										{...form.register('category')}
									/>
								</Field>

								<Field>
									<FieldLabel>
										Descripción{' '}
										<span className="text-xs text-muted-foreground font-normal">
											(opcional)
										</span>
									</FieldLabel>
									<Textarea
										rows={3}
										placeholder="Describe el producto brevemente…"
										{...form.register('description')}
									/>
								</Field>

								<div className="grid gap-4 sm:grid-cols-2">
									<Field
										data-invalid={Boolean(form.formState.errors.basePriceCents)}
									>
										<FieldLabel>Precio base (COP)</FieldLabel>
										<Input
											type="number"
											step={1}
											min={0}
											{...form.register('basePriceCents', {
												valueAsNumber: true,
											})}
										/>
										<FieldError>
											{form.formState.errors.basePriceCents?.message}
										</FieldError>
									</Field>

									<Field>
										<FieldLabel>
											Precio con descuento (COP){' '}
											<span className="text-xs text-muted-foreground font-normal">
												(opcional)
											</span>
										</FieldLabel>
										<Input
											type="number"
											min={0}
											step={1}
											{...form.register('priceDiscountCents', {
												valueAsNumber: true,
											})}
										/>
									</Field>
								</div>
							</div>
						</div>

						{/* ── Publicación ── */}
						<div className="overflow-hidden rounded-xl border">
							<SectionHeader
								title="Publicación"
								description="Controla el estado y disponibilidad del producto."
							/>
							<div className="divide-y">
								<div className="flex items-center justify-between px-4 py-3">
									<div>
										<p className="text-sm font-medium">Estado</p>
										<p className="text-xs text-muted-foreground">
											{watchedStatus === 'active'
												? 'Visible en el catálogo público'
												: watchedStatus === 'draft'
													? 'Solo visible para ti'
													: 'No visible para compradores'}
										</p>
									</div>
									<Select
										value={watchedStatus}
										onValueChange={(value) =>
											form.setValue(
												'status',
												value as ProductFormValues['status'],
											)
										}
									>
										<SelectTrigger className="w-36">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Borrador</SelectItem>
											<SelectItem value="active">Activo</SelectItem>
											<SelectItem value="inactive">Inactivo</SelectItem>
											<SelectItem value="archived">Archivado</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between px-4 py-3">
									<div>
										<p className="text-sm font-medium">
											Disponible para reserva
										</p>
										<p className="text-xs text-muted-foreground">
											Los compradores pueden reservar este producto
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant={watchedIsReservable ? 'default' : 'secondary'}
										>
											{watchedIsReservable ? 'Disponible' : 'Sin stock'}
										</Badge>
										<Checkbox
											checked={watchedIsReservable}
											onCheckedChange={(checked) =>
												form.setValue('isReservable', checked === true)
											}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* ── Imágenes ── */}
						<div className="overflow-hidden rounded-xl border">
							<SectionHeader
								title="Imágenes del producto"
								description="JPG, PNG o WebP · máx. 5 MB por imagen"
								action={
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => images.append(emptyImage())}
									>
										Añadir
									</Button>
								}
							/>
							<div className="space-y-3 p-4">
								<FieldError>{form.formState.errors.images?.message}</FieldError>
								{images.fields.map((field, index) => {
									const currentUrl = form.watch(`images.${index}.url`);
									const isUploading = uploadingImageIndex === index;
									return (
										<div
											key={field.id}
											className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-3"
										>
											{currentUrl ? (
												<img
													src={currentUrl}
													alt={`Imagen ${index + 1}`}
													className="h-16 w-16 shrink-0 rounded-lg border object-cover"
												/>
											) : (
												<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
													<HugeiconsIcon
														icon={ImageUploadIcon}
														className="size-5"
													/>
												</div>
											)}

											<div className="flex flex-1 flex-col gap-2">
												<input
													ref={(el) => {
														imageInputRefs.current[index] = el;
													}}
													type="file"
													accept="image/jpeg,image/png,image/webp"
													className="hidden"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) void handleImageFileSelected(file, index);
														e.target.value = '';
													}}
												/>
												<Button
													type="button"
													size="sm"
													variant="outline"
													disabled={isUploading || uploadingImageIndex !== null}
													onClick={() => imageInputRefs.current[index]?.click()}
												>
													{isUploading ? (
														<>
															<Spinner />
															Subiendo…
														</>
													) : currentUrl ? (
														'Cambiar imagen'
													) : (
														'Subir desde dispositivo'
													)}
												</Button>
												<Input
													placeholder="o pega una URL directamente"
													{...form.register(`images.${index}.url`)}
													className="text-xs"
												/>
												<FieldError>
													{form.formState.errors.images?.[index]?.url?.message}
												</FieldError>
											</div>

											{images.fields.length > 1 ? (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="shrink-0 text-muted-foreground"
													onClick={() => images.remove(index)}
												>
													Quitar
												</Button>
											) : null}
										</div>
									);
								})}
							</div>
						</div>

						{/* ── Variantes y stock ── */}
						<div className="overflow-hidden rounded-xl border">
							<SectionHeader
								title="Variantes y stock"
								description="Opcional — tallas, colores u otras diferencias del producto."
								action={
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => variants.append(emptyVariant())}
									>
										Añadir variante
									</Button>
								}
							/>
							<div className="p-4">
								{variants.fields.length === 0 ? (
									<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
										<HugeiconsIcon
											icon={PackageIcon}
											className="size-8 text-muted-foreground"
										/>
										<p className="text-sm text-muted-foreground">
											Sin variantes — el producto es un único artículo.
										</p>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => variants.append(emptyVariant())}
										>
											Añadir variante
										</Button>
									</div>
								) : (
									<div className="space-y-3">
										{variants.fields.map((field, index) => (
											<div
												key={field.id}
												className="rounded-lg border bg-muted/20 p-3"
											>
												<div className="mb-2 flex items-center justify-between">
													<p className="text-xs font-medium text-muted-foreground">
														Variante {index + 1}
													</p>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="h-6 px-2 text-xs text-muted-foreground"
														onClick={() => variants.remove(index)}
													>
														Quitar
													</Button>
												</div>
												<div className="grid gap-3 sm:grid-cols-2">
													<Field>
														<FieldLabel>SKU</FieldLabel>
														<Input
															placeholder="Ej. ZAP-42-ROJO"
															{...form.register(`variants.${index}.sku`)}
														/>
													</Field>
													<Field>
														<FieldLabel>Etiqueta</FieldLabel>
														<Input
															placeholder="Ej. Talla 42 / Rojo"
															{...form.register(`variants.${index}.label`)}
														/>
													</Field>
													<Field>
														<FieldLabel>Precio (COP)</FieldLabel>
														<Input
															type="number"
															step={1}
															min={0}
															{...form.register(
																`variants.${index}.priceCents`,
																{ valueAsNumber: true },
															)}
														/>
													</Field>
													<Field>
														<FieldLabel>Stock disponible</FieldLabel>
														<Input
															type="number"
															min={0}
															{...form.register(`variants.${index}.stock`, {
																valueAsNumber: true,
															})}
														/>
													</Field>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					<DialogFooter className="shrink-0 border-t px-6 py-4">
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
							) : initial ? (
								'Guardar cambios'
							) : (
								'Crear producto'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
