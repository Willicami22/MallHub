import {
	Building04Icon,
	ImageUploadIcon,
	LabelIcon,
	Mail01Icon,
	SmartPhone01Icon,
	Store02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Label,
	Separator,
	Spinner,
	Switch,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import {
	DEFAULT_HOURS,
	DEFAULT_STORE_CONFIG_VALUES,
	type StoreConfigHour,
	storeConfigFormOptions,
	useStoreConfigForm,
} from '@/features/store-admin-local/store-config/store-config.form';
import { useTRPC } from '@/features/trpc/trpc.context';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

type StoreData = {
	id: string;
	name: string;
	category: string | null;
	floor: string | null;
	localNumber: string | null;
	openHoursJson: unknown;
	logoImageUrl: string | null;
	phone: string | null;
	contactEmail: string | null;
	description: string | null;
	mall: { name: string; city: string } | null;
};

type StoreConfigFormPanelProps = {
	store: StoreData;
	onSaved: () => void;
};

function parseOpenHours(json: unknown): StoreConfigHour[] {
	if (!Array.isArray(json) || json.length === 0) return DEFAULT_HOURS;
	const parsed = json.filter(
		(item) =>
			typeof item === 'object' &&
			item !== null &&
			typeof (item as Record<string, unknown>).day === 'string' &&
			typeof (item as Record<string, unknown>).open === 'string' &&
			typeof (item as Record<string, unknown>).close === 'string' &&
			typeof (item as Record<string, unknown>).closed === 'boolean',
	) as StoreConfigHour[];
	return parsed.length === 7 ? parsed : DEFAULT_HOURS;
}

export function StoreConfigFormPanel({
	store,
	onSaved,
}: StoreConfigFormPanelProps) {
	const trpc = useTRPC();
	const logoInputRef = useRef<HTMLInputElement>(null);
	const [uploadingLogo, setUploadingLogo] = useState(false);

	const saveMutation = useMutation(
		trpc.storeAdminLocal.updateMyStore.mutationOptions({
			onSuccess: () => {
				toast.success('Información guardada correctamente.');
				onSaved();
			},
			onError: (error) => {
				toast.error(error.message || 'No se pudo guardar la información.');
			},
		}),
	);

	const getLogoUrl = useMutation(
		trpc.storeAdminLocal.getLogoUploadUrl.mutationOptions(),
	);

	const openHours = parseOpenHours(store.openHoursJson);

	const form = useStoreConfigForm({
		...storeConfigFormOptions,
		defaultValues: {
			...DEFAULT_STORE_CONFIG_VALUES,
			name: store.name,
			category: store.category ?? '',
			floor: store.floor ?? '',
			localNumber: store.localNumber ?? '',
			openHours,
			logoImageUrl: store.logoImageUrl ?? '',
			phone: store.phone ?? '',
			contactEmail: store.contactEmail ?? '',
			description: store.description ?? '',
		},
		onSubmit: async ({ value }) => {
			await saveMutation.mutateAsync({
				name: value.name,
				category: value.category,
				floor: value.floor,
				localNumber: value.localNumber,
				openHours: value.openHours,
				logoImageUrl: value.logoImageUrl,
				phone: value.phone || undefined,
				contactEmail: value.contactEmail || undefined,
				description: value.description || undefined,
			});
		},
	});

	const handleLogoFile = async (file: File) => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error('Formato no compatible. Use JPG, PNG o WebP.');
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error('El archivo supera el límite de 5 MB.');
			return;
		}
		setUploadingLogo(true);
		try {
			const { uploadUrl, publicUrl } = await getLogoUrl.mutateAsync({
				storeId: store.id,
				contentType: file.type,
				size: file.size,
			});
			const res = await fetch(uploadUrl, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type },
			});
			if (!res.ok) throw new Error('Upload failed');
			form.setFieldValue('logoImageUrl', publicUrl);
		} catch {
			toast.error('No se pudo subir el logo.');
		} finally {
			setUploadingLogo(false);
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* General info */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Datos de la tienda</CardTitle>
					<CardDescription className="text-sm">
						Completa la información para enviar tu tienda a revisión.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{store.mall && (
						<div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
							<HugeiconsIcon
								icon={Building04Icon}
								className="size-4 shrink-0"
							/>
							{store.mall.name} · {store.mall.city}
						</div>
					)}

					{store.mall && <Separator />}

					<form.Field name="name">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Nombre de la tienda</Label>
								<InputGroup>
									<InputGroupAddon align="inline-start">
										<HugeiconsIcon icon={Store02Icon} />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										type="text"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										data-invalid={
											field.state.meta.errors.length > 0 || undefined
										}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
								</InputGroup>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="category">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Categoría</Label>
								<InputGroup>
									<InputGroupAddon align="inline-start">
										<HugeiconsIcon icon={LabelIcon} />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										type="text"
										placeholder="Moda, tecnología, hogar…"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										data-invalid={
											field.state.meta.errors.length > 0 || undefined
										}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
								</InputGroup>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<div className="grid gap-4 sm:grid-cols-2">
						<form.Field name="floor">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Piso</Label>
									<Input
										id={field.name}
										type="text"
										placeholder="Ej: Planta baja, Piso 1"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										data-invalid={
											field.state.meta.errors.length > 0 || undefined
										}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-xs font-medium text-destructive">
											{field.state.meta.errors.join(', ')}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="localNumber">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Número de local</Label>
									<Input
										id={field.name}
										type="text"
										placeholder="Ej: 105-A"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										data-invalid={
											field.state.meta.errors.length > 0 || undefined
										}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-xs font-medium text-destructive">
											{field.state.meta.errors.join(', ')}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

					<Separator />

					<form.Field name="phone">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Teléfono de contacto</Label>
								<InputGroup>
									<InputGroupAddon align="inline-start">
										<HugeiconsIcon icon={SmartPhone01Icon} />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										type="tel"
										autoComplete="tel"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</InputGroup>
							</div>
						)}
					</form.Field>

					<form.Field name="contactEmail">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Correo de contacto</Label>
								<InputGroup>
									<InputGroupAddon align="inline-start">
										<HugeiconsIcon icon={Mail01Icon} />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										type="email"
										autoComplete="email"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</InputGroup>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Descripción</Label>
								<Textarea
									id={field.name}
									rows={4}
									placeholder="Describe tu tienda para los visitantes del mall…"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									data-invalid={field.state.meta.errors.length > 0 || undefined}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			{/* Horarios */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Horarios de atención</CardTitle>
				</CardHeader>
				<CardContent>
					<form.Field name="openHours" mode="array">
						{(field) => (
							<div className="space-y-2">
								{(field.state.value as StoreConfigHour[]).map((hour, idx) => (
									<div
										key={hour.day}
										className="flex flex-wrap items-center gap-3"
									>
										<span className="w-24 shrink-0 text-sm font-medium">
											{hour.day}
										</span>
										<form.Field name={`openHours[${idx}].closed`}>
											{(sub) => (
												<div className="flex items-center gap-1.5">
													<Switch
														id={`closed-${idx}`}
														checked={sub.state.value as boolean}
														onCheckedChange={(v) => sub.handleChange(v)}
													/>
													<Label
														htmlFor={`closed-${idx}`}
														className="text-xs text-muted-foreground"
													>
														Cerrado
													</Label>
												</div>
											)}
										</form.Field>
										{!hour.closed && (
											<>
												<form.Field name={`openHours[${idx}].open`}>
													{(sub) => (
														<label
															htmlFor={`hours-open-${idx}`}
															className="flex items-center gap-1 text-xs text-muted-foreground"
														>
															Abre
															<Input
																id={`hours-open-${idx}`}
																type="time"
																value={sub.state.value as string}
																onChange={(e) =>
																	sub.handleChange(e.target.value)
																}
																className="w-28"
															/>
														</label>
													)}
												</form.Field>
												<form.Field name={`openHours[${idx}].close`}>
													{(sub) => (
														<label
															htmlFor={`hours-close-${idx}`}
															className="flex items-center gap-1 text-xs text-muted-foreground"
														>
															Cierra
															<Input
																id={`hours-close-${idx}`}
																type="time"
																value={sub.state.value as string}
																onChange={(e) =>
																	sub.handleChange(e.target.value)
																}
																className="w-28"
															/>
														</label>
													)}
												</form.Field>
											</>
										)}
									</div>
								))}
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			{/* Logo */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Logo de la tienda</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						JPG, PNG, WebP · máx. 5 MB
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form.Field name="logoImageUrl">
						{(field) => (
							<div className="space-y-3">
								<div className="flex flex-wrap items-center gap-4">
									{field.state.value ? (
										<img
											src={field.state.value as string}
											alt="Logo"
											className="h-20 w-20 rounded-md border bg-muted object-contain"
										/>
									) : (
										<div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
											<HugeiconsIcon
												icon={ImageUploadIcon}
												className="size-8"
											/>
										</div>
									)}
									<div className="flex flex-col gap-2">
										<input
											ref={logoInputRef}
											type="file"
											accept="image/jpeg,image/png,image/webp"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) void handleLogoFile(file);
												e.target.value = '';
											}}
										/>
										<Button
											type="button"
											size="sm"
											variant="outline"
											disabled={uploadingLogo}
											onClick={() => logoInputRef.current?.click()}
										>
											{uploadingLogo ? (
												<>
													<Spinner />
													Subiendo…
												</>
											) : (
												'Subir logo'
											)}
										</Button>
										{field.state.value && (
											<Button
												type="button"
												size="sm"
												variant="ghost"
												className="text-destructive hover:text-destructive"
												onClick={() => field.handleChange('')}
											>
												Eliminar logo
											</Button>
										)}
									</div>
								</div>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit]}>
				{([isSubmitting, canSubmit]) => (
					<Button
						type="submit"
						disabled={(isSubmitting as boolean) || !(canSubmit as boolean)}
					>
						{(isSubmitting as boolean) ? (
							<>
								<Spinner />
								Guardando…
							</>
						) : (
							'Guardar información'
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
