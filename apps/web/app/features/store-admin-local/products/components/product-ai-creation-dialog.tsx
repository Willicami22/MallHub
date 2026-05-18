import { zodResolver } from '@hookform/resolvers/zod';
import {
	Cancel01Icon,
	ImageUploadIcon,
	PackageIcon,
	RefreshIcon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ProductUpsertDto } from '@/features/store-admin-local/products/services/product.service';
import { generateId } from '@/features/store-admin-local/shared/lib/uuid.lib';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

type ImageUploadMutation = {
	mutateAsync: (input: {
		storeId: string;
		contentType: string;
		size: number;
	}) => Promise<{ uploadUrl: string; publicUrl: string; key: string }>;
};

type AnalyzeImagesMutation = {
	mutateAsync: (input: { storeId: string; images: string[] }) => Promise<{
		names: string[];
		description: string;
		category: string | null;
		categoryConfidence: 'high' | 'medium' | 'low';
		variants: Array<{ label: string; type: string }>;
	}>;
	isPending: boolean;
};

type ProductAiCreationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	storeId: string;
	onSubmit: (dto: ProductUpsertDto) => Promise<void>;
	isSubmitting: boolean;
	getImageUploadUrlMutation: ImageUploadMutation;
	analyzeImagesMutation: AnalyzeImagesMutation;
};

type StagedFile = {
	id: string;
	file: File;
	previewUrl: string;
};

type VariantChip = {
	id: string;
	label: string;
	active: boolean;
};

type AiSuggestion = {
	names: string[];
	description: string;
	category: string | null;
	categoryConfidence: 'high' | 'medium' | 'low';
};

type Step = 'upload' | 'analyzing' | 'form';

const aiFormSchema = z.object({
	name: z.string().min(2, { error: 'Nombre demasiado corto' }),
	description: z.string().max(2000).optional(),
	category: z.string().max(120).optional(),
	basePriceCents: z
		.number()
		.int()
		.min(0, { error: 'Precio base en COP inválido' }),
	priceDiscountCents: z.number().int().min(0),
	status: z.enum(['draft', 'active', 'inactive', 'archived']),
	isReservable: z.boolean(),
});

type AiFormValues = z.infer<typeof aiFormSchema>;

async function resizeAndEncodeForAI(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);
		img.onload = () => {
			const maxDim = 512;
			let { width, height } = img;
			if (width > maxDim || height > maxDim) {
				if (width > height) {
					height = Math.round((height / width) * maxDim);
					width = maxDim;
				} else {
					width = Math.round((width / height) * maxDim);
					height = maxDim;
				}
			}
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				URL.revokeObjectURL(objectUrl);
				reject(new Error('canvas context unavailable'));
				return;
			}
			ctx.drawImage(img, 0, 0, width, height);
			URL.revokeObjectURL(objectUrl);
			resolve(canvas.toDataURL('image/jpeg', 0.75));
		};
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error('image load failed'));
		};
		img.src = objectUrl;
	});
}

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

function AiBadge() {
	return (
		<div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
			<HugeiconsIcon icon={SparklesIcon} className="size-3" />
			Sugerido por IA
		</div>
	);
}

export function ProductAiCreationDialog({
	open,
	onOpenChange,
	storeId,
	onSubmit,
	isSubmitting,
	getImageUploadUrlMutation,
	analyzeImagesMutation,
}: ProductAiCreationDialogProps) {
	const [step, setStep] = useState<Step>('upload');
	const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
	const [analysisError, setAnalysisError] = useState<string | null>(null);
	const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
	const [selectedNameIndex, setSelectedNameIndex] = useState(0);
	const [variantChips, setVariantChips] = useState<VariantChip[]>([]);
	const [newVariantInput, setNewVariantInput] = useState('');
	const [isDragOver, setIsDragOver] = useState(false);
	const [isUploadingImages, setIsUploadingImages] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const stagedFilesRef = useRef<StagedFile[]>([]);
	stagedFilesRef.current = stagedFiles;

	const form = useForm<AiFormValues>({
		resolver: zodResolver(aiFormSchema),
		defaultValues: {
			name: '',
			description: '',
			category: '',
			basePriceCents: 0,
			priceDiscountCents: 0,
			status: 'draft',
			isReservable: true,
		},
	});

	useEffect(() => {
		if (!open) {
			for (const f of stagedFilesRef.current) {
				URL.revokeObjectURL(f.previewUrl);
			}
			setStagedFiles([]);
			setStep('upload');
			setAnalysisError(null);
			setAiSuggestion(null);
			setSelectedNameIndex(0);
			setVariantChips([]);
			setNewVariantInput('');
			setIsUploadingImages(false);
			form.reset({
				name: '',
				description: '',
				category: '',
				basePriceCents: 0,
				priceDiscountCents: 0,
				status: 'draft',
				isReservable: true,
			});
		}
	}, [open, form]);

	const addFiles = (incoming: File[]) => {
		const valid = incoming.filter((f) => {
			if (!ALLOWED_TYPES.includes(f.type)) {
				toast.error('Formatos válidos: JPG, PNG, WebP');
				return false;
			}
			if (f.size > MAX_BYTES) {
				toast.error(`"${f.name}" supera el límite de 5 MB`);
				return false;
			}
			return true;
		});

		setStagedFiles((prev) => {
			const remaining = MAX_FILES - prev.length;
			if (remaining <= 0) {
				toast.error(`Máximo ${MAX_FILES} imágenes permitidas`);
				return prev;
			}
			const toAdd = valid.slice(0, remaining);
			if (valid.length > remaining) {
				toast.error(`Solo se pueden agregar ${remaining} imagen(es) más`);
			}
			return [
				...prev,
				...toAdd.map((file) => ({
					id: generateId(),
					file,
					previewUrl: URL.createObjectURL(file),
				})),
			];
		});
	};

	const removeFile = (id: string) => {
		setStagedFiles((prev) => {
			const removed = prev.find((f) => f.id === id);
			if (removed) URL.revokeObjectURL(removed.previewUrl);
			return prev.filter((f) => f.id !== id);
		});
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		addFiles(Array.from(e.dataTransfer.files));
	};

	const applyAnalysisResult = (result: {
		names: string[];
		description: string;
		category: string | null;
		categoryConfidence: 'high' | 'medium' | 'low';
		variants: Array<{ label: string; type: string }>;
	}) => {
		setAiSuggestion({
			names: result.names,
			description: result.description,
			category: result.category,
			categoryConfidence: result.categoryConfidence,
		});
		setSelectedNameIndex(0);
		setVariantChips(
			result.variants.map((v) => ({
				id: generateId(),
				label: v.label,
				active: true,
			})),
		);
		form.reset({
			name: result.names[0] ?? '',
			description: result.description,
			category: result.category ?? '',
			basePriceCents: 0,
			priceDiscountCents: 0,
			status: 'draft',
			isReservable: true,
		});
	};

	const handleAnalyze = async () => {
		setAnalysisError(null);
		setStep('analyzing');
		try {
			const base64Images = await Promise.all(
				stagedFiles.map((f) => resizeAndEncodeForAI(f.file)),
			);
			const result = await analyzeImagesMutation.mutateAsync({
				storeId,
				images: base64Images,
			});
			applyAnalysisResult(result);
			setStep('form');
		} catch {
			setStep('upload');
			setAnalysisError('El análisis de IA no está disponible en este momento.');
		}
	};

	const handleReanalyze = async () => {
		const previousStep = step;
		setStep('analyzing');
		try {
			const base64Images = await Promise.all(
				stagedFiles.map((f) => resizeAndEncodeForAI(f.file)),
			);
			const result = await analyzeImagesMutation.mutateAsync({
				storeId,
				images: base64Images,
			});
			applyAnalysisResult(result);
			setStep('form');
		} catch {
			setStep(previousStep === 'form' ? 'form' : 'upload');
			toast.error('No se pudo repetir el análisis.');
		}
	};

	const handleRegenerateField = async (field: 'names' | 'description') => {
		try {
			const base64Images = await Promise.all(
				stagedFiles.map((f) => resizeAndEncodeForAI(f.file)),
			);
			const result = await analyzeImagesMutation.mutateAsync({
				storeId,
				images: base64Images,
			});
			if (field === 'names') {
				setAiSuggestion((prev) =>
					prev ? { ...prev, names: result.names } : prev,
				);
				setSelectedNameIndex(0);
				form.setValue('name', result.names[0] ?? '');
			} else {
				form.setValue('description', result.description);
			}
		} catch {
			toast.error('No se pudo regenerar el campo.');
		}
	};

	const toggleChip = (id: string) => {
		setVariantChips((prev) =>
			prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
		);
	};

	const addVariantChip = () => {
		const label = newVariantInput.trim();
		if (!label) return;
		setVariantChips((prev) => [
			...prev,
			{ id: generateId(), label, active: true },
		]);
		setNewVariantInput('');
	};

	const doSubmit = async (overrideStatus: 'draft' | 'active') => {
		const values = form.getValues();

		if (overrideStatus === 'active' && values.basePriceCents <= 0) {
			form.setError('basePriceCents', {
				type: 'manual',
				message: 'Ingresa un precio para publicar el producto',
			});
			return;
		}

		if (!values.name || values.name.length < 2) {
			form.setError('name', {
				type: 'manual',
				message: 'Nombre demasiado corto',
			});
			return;
		}

		setIsUploadingImages(true);
		const uploadedUrls: string[] = [];

		try {
			for (const staged of stagedFiles) {
				const { uploadUrl, publicUrl } =
					await getImageUploadUrlMutation.mutateAsync({
						storeId,
						contentType: staged.file.type,
						size: staged.file.size,
					});
				const res = await fetch(uploadUrl, {
					method: 'PUT',
					body: staged.file,
					headers: { 'Content-Type': staged.file.type },
				});
				if (!res.ok) throw new Error('upload failed');
				uploadedUrls.push(publicUrl);
			}
		} catch {
			toast.error('No se pudieron subir las imágenes.');
			setIsUploadingImages(false);
			return;
		}

		setIsUploadingImages(false);

		const activeVariants = variantChips
			.filter((c) => c.active)
			.map((c, i) => ({
				sku: `VAR-${String(i + 1).padStart(2, '0')}`,
				label: c.label,
				priceCents: values.basePriceCents > 0 ? values.basePriceCents : 0,
				stock: 0,
			}));

		const dto: ProductUpsertDto = {
			storeId,
			name: values.name,
			category: values.category?.trim() ? values.category.trim() : null,
			description: values.description?.trim()
				? values.description.trim()
				: null,
			basePriceCents: values.basePriceCents,
			priceDiscountCents:
				values.priceDiscountCents > 0 ? values.priceDiscountCents : null,
			status: overrideStatus,
			isReservable: values.isReservable,
			images: uploadedUrls,
			isPublished: overrideStatus === 'active',
			variants: activeVariants,
		};

		await onSubmit(dto);
		onOpenChange(false);
	};

	const watchedStatus = form.watch('status');
	const watchedIsReservable = form.watch('isReservable');
	const isBusy =
		isSubmitting || isUploadingImages || analyzeImagesMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				{step === 'upload' && (
					<>
						<DialogHeader className="shrink-0 border-b px-6 py-4">
							<DialogTitle className="flex items-center gap-2">
								<HugeiconsIcon
									icon={SparklesIcon}
									className="size-5 text-primary"
								/>
								Crear con IA
							</DialogTitle>
							<p className="text-sm text-muted-foreground">
								Sube fotos del producto y la IA generará el nombre, descripción,
								categoría y variantes automáticamente.
							</p>
						</DialogHeader>

						<div className="flex-1 overflow-y-auto px-6 py-5">
							{analysisError ? (
								<div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
									{analysisError}
									<div className="mt-2 flex gap-2">
										<Button
											type="button"
											size="sm"
											variant="outline"
											onClick={() => setAnalysisError(null)}
										>
											Reintentar
										</Button>
										<Button
											type="button"
											size="sm"
											variant="ghost"
											onClick={() => onOpenChange(false)}
										>
											Completar manualmente
										</Button>
									</div>
								</div>
							) : null}

							<div className="space-y-4">
								<button
									type="button"
									className={`flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
										isDragOver
											? 'border-primary bg-primary/5'
											: 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
									}`}
									onDragOver={(e) => {
										e.preventDefault();
										setIsDragOver(true);
									}}
									onDragLeave={() => setIsDragOver(false)}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}
								>
									<HugeiconsIcon
										icon={ImageUploadIcon}
										className="size-8 text-muted-foreground"
									/>
									<div>
										<p className="text-sm font-medium">
											Arrastra imágenes aquí o haz clic para seleccionar
										</p>
										<p className="text-xs text-muted-foreground">
											JPG, PNG o WebP · máx. 5 MB · hasta {MAX_FILES} imágenes
										</p>
									</div>
									<input
										ref={fileInputRef}
										type="file"
										multiple
										accept="image/jpeg,image/png,image/webp"
										className="hidden"
										onChange={(e) => {
											if (e.target.files) addFiles(Array.from(e.target.files));
											e.target.value = '';
										}}
									/>
								</button>

								{stagedFiles.length > 0 ? (
									<div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
										{stagedFiles.map((staged) => (
											<div
												key={staged.id}
												className="group relative aspect-square overflow-hidden rounded-lg border"
											>
												<img
													src={staged.previewUrl}
													alt="Vista previa"
													className="h-full w-full object-cover"
												/>
												<button
													type="button"
													onClick={() => removeFile(staged.id)}
													className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
												>
													<HugeiconsIcon
														icon={Cancel01Icon}
														className="size-3"
													/>
												</button>
											</div>
										))}
									</div>
								) : null}
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
							<Button
								type="button"
								disabled={stagedFiles.length === 0}
								onClick={handleAnalyze}
								className="gap-2"
							>
								<HugeiconsIcon icon={SparklesIcon} className="size-4" />
								Analizar con IA
							</Button>
						</DialogFooter>
					</>
				)}

				{step === 'analyzing' && (
					<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
						<Spinner className="size-8" />
						<div className="text-center">
							<p className="text-base font-medium">Analizando tu producto…</p>
							<p className="mt-1 text-sm text-muted-foreground">
								La IA está identificando nombre, descripción, categoría y
								variantes.
							</p>
						</div>
						{stagedFiles.length > 0 ? (
							<div className="flex gap-2">
								{stagedFiles.slice(0, 5).map((staged) => (
									<img
										key={staged.id}
										src={staged.previewUrl}
										alt="Analizando"
										className="size-12 rounded-lg border object-cover opacity-60"
									/>
								))}
							</div>
						) : null}
					</div>
				)}

				{step === 'form' && aiSuggestion ? (
					<>
						<DialogHeader className="shrink-0 border-b px-6 py-4">
							<DialogTitle className="flex items-center gap-2">
								<HugeiconsIcon
									icon={SparklesIcon}
									className="size-5 text-primary"
								/>
								Nuevo producto — Asistido por IA
							</DialogTitle>
							<p className="text-sm text-muted-foreground">
								Revisa y edita el contenido generado. Campos marcados con{' '}
								<span className="font-medium text-primary">
									Sugerido por IA
								</span>{' '}
								fueron generados automáticamente.
							</p>
						</DialogHeader>

						<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
							{/* Imágenes */}
							<div className="overflow-hidden rounded-xl border">
								<SectionHeader
									title="Imágenes analizadas"
									description={`${stagedFiles.length} imagen(es) · se subirán al publicar`}
								/>
								<div className="flex flex-wrap gap-2 p-4">
									{stagedFiles.map((staged) => (
										<img
											key={staged.id}
											src={staged.previewUrl}
											alt="Vista previa"
											className="size-16 rounded-lg border object-cover"
										/>
									))}
								</div>
							</div>

							{/* Nombre */}
							<div className="overflow-hidden rounded-xl border">
								<SectionHeader
									title="Nombre del producto"
									action={<AiBadge />}
								/>
								<div className="space-y-3 p-4">
									{aiSuggestion.names.length > 1 ? (
										<div className="flex flex-wrap gap-2">
											{aiSuggestion.names.map((name, i) => (
												<button
													key={`name-${String(i)}`}
													type="button"
													onClick={() => {
														setSelectedNameIndex(i);
														form.setValue('name', name, {
															shouldValidate: true,
														});
													}}
													className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
														selectedNameIndex === i
															? 'border-primary bg-primary/10 text-primary'
															: 'border-border bg-muted/30 text-foreground hover:border-primary/50'
													}`}
												>
													{name}
												</button>
											))}
										</div>
									) : null}

									<Field data-invalid={Boolean(form.formState.errors.name)}>
										<FieldLabel>Editar nombre</FieldLabel>
										<Input
											placeholder="Nombre del producto"
											{...form.register('name')}
										/>
										<FieldError>
											{form.formState.errors.name?.message}
										</FieldError>
									</Field>

									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={analyzeImagesMutation.isPending}
										onClick={() => handleRegenerateField('names')}
										className="gap-1.5 text-muted-foreground"
									>
										{analyzeImagesMutation.isPending ? (
											<Spinner />
										) : (
											<HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
										)}
										Regenerar nombres
									</Button>
								</div>
							</div>

							{/* Descripción */}
							<div className="overflow-hidden rounded-xl border">
								<SectionHeader title="Descripción" action={<AiBadge />} />
								<div className="space-y-2 p-4">
									<Field>
										<Textarea
											rows={3}
											placeholder="Describe el producto brevemente…"
											{...form.register('description')}
										/>
									</Field>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={analyzeImagesMutation.isPending}
										onClick={() => handleRegenerateField('description')}
										className="gap-1.5 text-muted-foreground"
									>
										{analyzeImagesMutation.isPending ? (
											<Spinner />
										) : (
											<HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
										)}
										Regenerar descripción
									</Button>
								</div>
							</div>

							{/* Categoría */}
							<div className="overflow-hidden rounded-xl border">
								<SectionHeader
									title="Categoría"
									action={
										aiSuggestion.categoryConfidence !== 'low' ? (
											<AiBadge />
										) : null
									}
								/>
								<div className="p-4">
									{aiSuggestion.categoryConfidence === 'low' ? (
										<p className="mb-2 text-xs text-muted-foreground">
											No se pudo determinar la categoría con certeza. Selecciona
											manualmente.
										</p>
									) : null}
									<Field>
										<FieldLabel>
											Categoría{' '}
											<span className="text-xs text-muted-foreground font-normal">
												(opcional)
											</span>
										</FieldLabel>
										<Input
											placeholder="Ej. Calzado, Accesorios, Hogar"
											{...form.register('category')}
										/>
									</Field>
								</div>
							</div>

							{/* Variantes */}
							<div className="overflow-hidden rounded-xl border">
								<SectionHeader
									title="Variantes detectadas"
									description="Acepta, elimina o agrega variantes manualmente."
									action={
										variantChips.some((c) => c.active) ? <AiBadge /> : null
									}
								/>
								<div className="space-y-3 p-4">
									{variantChips.length === 0 ? (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<HugeiconsIcon
												icon={PackageIcon}
												className="size-4 shrink-0"
											/>
											No se detectaron variantes en las imágenes.
										</div>
									) : (
										<div className="flex flex-wrap gap-2">
											{variantChips.map((chip) => (
												<button
													key={chip.id}
													type="button"
													onClick={() => toggleChip(chip.id)}
													className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
														chip.active
															? 'border-primary bg-primary/10 text-primary'
															: 'border-border bg-muted/20 text-muted-foreground line-through'
													}`}
												>
													{chip.label}
													<HugeiconsIcon
														icon={Cancel01Icon}
														className="size-3 opacity-60"
													/>
												</button>
											))}
										</div>
									)}

									<div className="flex gap-2">
										<Input
											placeholder="Agregar variante (ej. Verde, Talla M)"
											value={newVariantInput}
											onChange={(e) => setNewVariantInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addVariantChip();
												}
											}}
											className="text-sm"
										/>
										<Button
											type="button"
											size="sm"
											variant="outline"
											onClick={addVariantChip}
										>
											Agregar
										</Button>
									</div>
								</div>
							</div>

							{/* Precio */}
							<div className="overflow-hidden rounded-xl border">
								<SectionHeader
									title="Precio"
									description="La IA no estima precios — ingresa el precio manualmente."
								/>
								<div className="space-y-3 p-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<Field
											data-invalid={Boolean(
												form.formState.errors.basePriceCents,
											)}
										>
											<FieldLabel>Precio base (COP)</FieldLabel>
											<Input
												type="number"
												step={1}
												min={0}
												placeholder="0"
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

							{/* Publicación */}
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
												form.setValue('status', value as AiFormValues['status'])
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
						</div>

						<DialogFooter className="shrink-0 flex-wrap gap-2 border-t px-6 py-4">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isBusy}
								onClick={handleReanalyze}
								className="mr-auto gap-1.5"
							>
								<HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
								Volver a analizar
							</Button>

							<Button
								type="button"
								variant="outline"
								disabled={isBusy}
								onClick={() => doSubmit('draft')}
							>
								{isUploadingImages ? (
									<>
										<Spinner />
										Subiendo…
									</>
								) : (
									'Guardar borrador'
								)}
							</Button>

							<Button
								type="button"
								disabled={isBusy}
								onClick={() => doSubmit('active')}
							>
								{isSubmitting || isUploadingImages ? (
									<>
										<Spinner />
										{isUploadingImages ? 'Subiendo…' : 'Publicando…'}
									</>
								) : (
									'Publicar producto'
								)}
							</Button>
						</DialogFooter>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
