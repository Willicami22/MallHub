import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUploadIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
	toast,
} from '@mallhub/ui';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { Store } from '@/features/store-admin-local/shared/types/domain.models';
import {
	type StoreProfileFormValues,
	storeProfileFormSchema,
} from '@/features/store-admin-local/store-profile/schemas/store-profile.schemas';

type StoreProfileEditorProps = {
	store: Store | null | undefined;
	onSave: (values: StoreProfileFormValues) => Promise<void>;
	isSaving: boolean;
	getLogoUploadUrlMutation?: any;
	getBannerUploadUrlMutation?: any;
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function StoreProfileEditor({
	store,
	onSave,
	isSaving,
	getLogoUploadUrlMutation,
	getBannerUploadUrlMutation,
}: StoreProfileEditorProps) {
	const logoInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);
	const [uploadingLogo, setUploadingLogo] = useState(false);
	const [uploadingBanner, setUploadingBanner] = useState(false);

	const form = useForm<StoreProfileFormValues>({
		resolver: zodResolver(storeProfileFormSchema),
		defaultValues: {
			name: '',
			description: '',
			logoImageUrl: '',
			bannerImageUrl: '',
			openHours: [],
			socialLinks: [],
		},
	});

	const { fields: hoursFields } = useFieldArray({
		control: form.control,
		name: 'openHours',
	});

	const {
		fields: linksFields,
		append: appendLink,
		remove: removeLink,
	} = useFieldArray({
		control: form.control,
		name: 'socialLinks',
	});

	useEffect(() => {
		if (!store) {
			return;
		}
		form.reset({
			name: store.name,
			description: store.description ?? '',
			logoImageUrl: store.logoImageUrl ?? '',
			bannerImageUrl: store.bannerImageUrl ?? '',
			openHours: Array.isArray(store.openHoursJson) ? store.openHoursJson : [],
			socialLinks: Array.isArray(store.socialLinksJson)
				? store.socialLinksJson
				: [],
		});
	}, [store, form]);

	const onSubmit = form.handleSubmit(async (values) => {
		await onSave(values);
	});

	const handleImageFile = async (
		file: File,
		type: 'logo' | 'banner',
		mutation: any,
		setUploading: (val: boolean) => void,
	) => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error('Formato no compatible. Use JPG, PNG o WebP.');
			return;
		}
		const maxSize = type === 'logo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error(
				`El archivo supera el límite de ${type === 'logo' ? '5' : '10'} MB.`,
			);
			return;
		}

		if (!mutation || !store?.id) {
			toast.error('No se puede subir la imagen en este momento.');
			return;
		}

		setUploading(true);
		try {
			const { uploadUrl, publicUrl } = await mutation.mutateAsync({
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
			form.setValue(
				type === 'logo' ? 'logoImageUrl' : 'bannerImageUrl',
				publicUrl,
				{ shouldValidate: true },
			);
		} catch {
			toast.error(`No se pudo subir el ${type}.`);
		} finally {
			setUploading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Perfil público</CardTitle>
				<CardDescription className="text-sm">
					Información visible para los clientes.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-6" onSubmit={onSubmit}>
					<div className="grid gap-6 md:grid-cols-2">
						<Field data-invalid={Boolean(form.formState.errors.name)}>
							<FieldLabel>Nombre de la tienda</FieldLabel>
							<Input {...form.register('name')} disabled={!store} />
							<FieldError>{form.formState.errors.name?.message}</FieldError>
						</Field>

						<Field data-invalid={Boolean(form.formState.errors.description)}>
							<FieldLabel>Descripción</FieldLabel>
							<Textarea
								rows={3}
								{...form.register('description')}
								disabled={!store}
							/>
							<FieldError>
								{form.formState.errors.description?.message}
							</FieldError>
						</Field>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-3">
							<FieldLabel>Logo de la tienda</FieldLabel>
							<div className="flex flex-wrap items-center gap-4">
								{form.watch('logoImageUrl') ? (
									<img
										src={form.watch('logoImageUrl')}
										alt="Logo"
										className="h-20 w-20 rounded-md border bg-muted object-contain"
									/>
								) : (
									<div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
										<HugeiconsIcon icon={ImageUploadIcon} className="size-8" />
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
											if (file)
												void handleImageFile(
													file,
													'logo',
													getLogoUploadUrlMutation,
													setUploadingLogo,
												);
											e.target.value = '';
										}}
									/>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={uploadingLogo || !store}
										onClick={() => logoInputRef.current?.click()}
									>
										{uploadingLogo ? (
											<>
												<Spinner /> Subiendo…
											</>
										) : (
											'Subir logo'
										)}
									</Button>
								</div>
							</div>
							{form.formState.errors.logoImageUrl && (
								<p className="text-xs font-medium text-destructive">
									{form.formState.errors.logoImageUrl.message}
								</p>
							)}
						</div>

						<div className="space-y-3">
							<FieldLabel>Banner promocional</FieldLabel>
							<div className="flex flex-col gap-4">
								{form.watch('bannerImageUrl') ? (
									<img
										src={form.watch('bannerImageUrl')}
										alt="Banner"
										className="h-32 w-full rounded-md border bg-muted object-cover"
									/>
								) : (
									<div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
										<HugeiconsIcon icon={ImageUploadIcon} className="size-8" />
									</div>
								)}
								<div>
									<input
										ref={bannerInputRef}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file)
												void handleImageFile(
													file,
													'banner',
													getBannerUploadUrlMutation,
													setUploadingBanner,
												);
											e.target.value = '';
										}}
									/>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={uploadingBanner || !store}
										onClick={() => bannerInputRef.current?.click()}
									>
										{uploadingBanner ? (
											<>
												<Spinner /> Subiendo…
											</>
										) : (
											'Subir banner'
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<FieldLabel>Redes Sociales</FieldLabel>
						{linksFields.map((field, index) => (
							<div key={field.id} className="flex gap-2 items-center">
								<Input
									placeholder="Plataforma (ej. Instagram)"
									{...form.register(`socialLinks.${index}.platform`)}
									className="w-1/3"
									disabled={!store}
								/>
								<Input
									placeholder="URL"
									{...form.register(`socialLinks.${index}.url`)}
									className="flex-1"
									disabled={!store}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => removeLink(index)}
									disabled={!store}
								>
									Quitar
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => appendLink({ platform: '', url: '' })}
							disabled={!store}
						>
							Agregar Red Social
						</Button>
					</div>

					<Button type="submit" disabled={isSaving || !store}>
						{isSaving ? (
							<>
								<Spinner />
								Guardando…
							</>
						) : (
							'Guardar perfil'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
