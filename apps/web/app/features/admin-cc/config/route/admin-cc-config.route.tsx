import {
	Delete01Icon,
	ImageUploadIcon,
	LinkSquare01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
	Input,
	Label,
	Separator,
	Switch,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime';
import {
	DEFAULT_FORM_VALUES,
	DEFAULT_HOURS,
	type MallConfigHour,
	mallConfigFormOptions,
	useMallConfigForm,
} from '../mall-settings.form';
import type { Route } from './+types/admin-cc-config.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: `${m.admin_cc_settings_title()} | Admin CC` }];
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

function useImageUpload(
	folder: 'logos' | 'heroes' | 'gallery',
	mallId: string | undefined,
	onSuccess: (publicUrl: string) => void,
) {
	const trpc = useTRPC();
	const [uploading, setUploading] = useState(false);

	const getPresignedUrl = useMutation(
		trpc.adminCc.config.getUploadPresignedUrl.mutationOptions(),
	);

	const handleFile = async (file: File) => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error(m.admin_cc_settings_image_format_error());
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error(m.admin_cc_settings_image_size_error());
			return;
		}

		setUploading(true);
		try {
			if (!mallId) {
				toast.error(m.admin_cc_dashboard_error());
				return;
			}

			const { uploadUrl, publicUrl } = await getPresignedUrl.mutateAsync({
				contentType: file.type,
				folder,
				mallId,
				size: file.size,
			});

			const res = await fetch(uploadUrl, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type },
			});

			if (!res.ok) throw new Error('Upload failed');

			onSuccess(publicUrl);
		} catch {
			toast.error(m.admin_cc_settings_upload_error());
		} finally {
			setUploading(false);
		}
	};

	return { uploading, handleFile };
}

export default function AdminCcConfigRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery(
		trpc.adminCc.config.getConfig.queryOptions(),
	);

	// Local image state (optimistic, loaded from query)
	const [logoUrl, setLogoUrl] = useState<string | null>(null);
	const [heroUrl, setHeroUrl] = useState<string | null>(null);
	const [gallery, setGallery] = useState<
		Array<{ id: string; imageUrl: string; label: string | null }>
	>([]);
	const [imagesInitialized, setImagesInitialized] = useState(false);
	const mallId = data?.mallId;

	if (data && !imagesInitialized) {
		setLogoUrl(data.logoImageUrl);
		setHeroUrl(data.heroImageUrl);
		setGallery(data.galleryImages);
		setImagesInitialized(true);
	}

	// Mutations
	const updateConfig = useMutation(
		trpc.adminCc.config.updateConfig.mutationOptions({
			onSuccess: () => toast(m.admin_cc_settings_saved()),
			onError: () => toast.error(m.admin_cc_settings_upload_error()),
		}),
	);

	const updateImages = useMutation(
		trpc.adminCc.config.updateImages.mutationOptions({
			onSuccess: () =>
				queryClient.invalidateQueries(
					trpc.adminCc.config.getConfig.queryOptions(),
				),
		}),
	);

	const addGalleryImage = useMutation(
		trpc.adminCc.config.addGalleryImage.mutationOptions({
			onSuccess: (img) => setGallery((prev) => [...prev, img]),
		}),
	);

	const deleteGalleryImage = useMutation(
		trpc.adminCc.config.deleteGalleryImage.mutationOptions({
			onSuccess: (_, vars) =>
				setGallery((prev) => prev.filter((img) => img.id !== vars.imageId)),
		}),
	);

	// Image uploaders
	const logoUploader = useImageUpload('logos', mallId, async (url) => {
		if (!mallId) return;
		setLogoUrl(url);
		await updateImages.mutateAsync({ mallId, logoImageUrl: url });
	});

	const heroUploader = useImageUpload('heroes', mallId, async (url) => {
		if (!mallId) return;
		setHeroUrl(url);
		await updateImages.mutateAsync({ mallId, heroImageUrl: url });
	});

	const galleryUploader = useImageUpload('gallery', mallId, async (url) => {
		if (!mallId) return;
		await addGalleryImage.mutateAsync({ mallId, imageUrl: url });
	});

	// File input refs
	const logoInputRef = useRef<HTMLInputElement>(null);
	const heroInputRef = useRef<HTMLInputElement>(null);
	const galleryInputRef = useRef<HTMLInputElement>(null);

	// Form
	const form = useMallConfigForm({
		...mallConfigFormOptions,
		defaultValues: data
			? {
					name: data.name,
					city: data.city,
					address: data.address,
					description: data.description,
					phone: data.phone,
					openHours: data.openHours.length > 0 ? data.openHours : DEFAULT_HOURS,
					socialLinks: data.socialLinks,
				}
			: DEFAULT_FORM_VALUES,
		onSubmit: async ({ value }) => {
			if (!mallId) return;

			await updateConfig.mutateAsync({
				mallId,
				name: value.name,
				city: value.city,
				address: value.address,
				description: value.description || undefined,
				phone: value.phone || undefined,
				openHours: value.openHours,
				socialLinks: value.socialLinks,
			});
		},
	});

	if (isLoading) {
		return (
			<div className="flex justify-center p-12 text-muted-foreground">
				{m.admin_cc_dashboard_loading()}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-8 text-center text-destructive text-sm">
				{m.admin_cc_dashboard_error()}
			</div>
		);
	}

	return (
		<div className="max-w-4xl space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{m.admin_cc_settings_title()}
					</h1>
					<p className="text-muted-foreground">
						{m.admin_cc_settings_subtitle()}
					</p>
				</div>
				{data?.mallId && (
					<a
						href={localizeHref(`/malls/${data.mallId}`)}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						<HugeiconsIcon icon={LinkSquare01Icon} className="size-4" />
						{m.admin_cc_settings_preview()}
					</a>
				)}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* General info */}
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_cc_settings_general()}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											data-invalid={
												field.state.meta.errors.length > 0 || undefined
											}
										>
											{m.admin_cc_settings_general_name()}
										</Label>
										<Input
											id={field.name}
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

							<form.Field name="city">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											data-invalid={
												field.state.meta.errors.length > 0 || undefined
											}
										>
											{m.admin_cc_settings_general_city()}
										</Label>
										<Input
											id={field.name}
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

						<form.Field name="address">
							{(field) => (
								<div className="space-y-2">
									<Label
										htmlFor={field.name}
										data-invalid={
											field.state.meta.errors.length > 0 || undefined
										}
									>
										{m.admin_cc_settings_general_address()}
									</Label>
									<Input
										id={field.name}
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

						<form.Field name="phone">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										{m.admin_cc_settings_general_phone()}
									</Label>
									<Input
										id={field.name}
										type="tel"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										{m.admin_cc_settings_general_desc()}
									</Label>
									<Textarea
										id={field.name}
										rows={3}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						</form.Field>
					</CardContent>
				</Card>

				{/* Hours */}
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_cc_settings_hours()}</CardTitle>
					</CardHeader>
					<CardContent>
						<form.Field name="openHours" mode="array">
							{(field) => (
								<div className="space-y-2">
									{(field.state.value as MallConfigHour[]).map((hour, idx) => (
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
															{m.admin_cc_settings_hours_closed()}
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
																{m.admin_cc_settings_hours_open()}
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
																{m.admin_cc_settings_hours_close()}
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

				{/* Social media */}
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_cc_settings_social()}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{(['instagram', 'facebook', 'website'] as const).map((key) => (
							<form.Field key={key} name={`socialLinks.${key}`}>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>
											{key === 'instagram'
												? m.admin_cc_settings_social_instagram()
												: key === 'facebook'
													? m.admin_cc_settings_social_facebook()
													: m.admin_cc_settings_social_website()}
										</Label>
										<Input
											id={field.name}
											type="url"
											placeholder="https://"
											value={field.state.value as string}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</div>
								)}
							</form.Field>
						))}
					</CardContent>
				</Card>

				{/* Save button */}
				<div className="flex justify-end">
					<form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit]}>
						{([isSubmitting, canSubmit]) => (
							<Button
								type="submit"
								disabled={(isSubmitting as boolean) || !(canSubmit as boolean)}
							>
								{(isSubmitting as boolean)
									? m.admin_cc_settings_saving()
									: m.admin_cc_settings_save()}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>

			<Separator />

			{/* Logo */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_logo()}</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						JPG, PNG, WebP · máx. 5 MB
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap items-center gap-4">
					{logoUrl ? (
						<img
							src={logoUrl}
							alt="Logo"
							className="h-20 w-20 rounded-md border object-contain bg-muted"
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
								if (file) logoUploader.handleFile(file);
								e.target.value = '';
							}}
						/>
						<Button
							size="sm"
							variant="outline"
							disabled={logoUploader.uploading}
							onClick={() => logoInputRef.current?.click()}
						>
							{logoUploader.uploading
								? m.admin_cc_settings_image_uploading()
								: m.admin_cc_settings_logo_upload()}
						</Button>
						{logoUrl && (
							<Button
								size="sm"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								onClick={async () => {
									if (!mallId) return;
									setLogoUrl(null);
									await updateImages.mutateAsync({
										mallId,
										logoImageUrl: null,
									});
								}}
							>
								{m.admin_cc_settings_logo_remove()}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Hero image */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_hero()}</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						JPG, PNG, WebP · máx. 5 MB · recomendado 1200×400 px
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{heroUrl ? (
						<img
							src={heroUrl}
							alt="Hero"
							className="w-full rounded-md border object-cover max-h-48 bg-muted"
						/>
					) : (
						<div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
							<HugeiconsIcon icon={ImageUploadIcon} className="size-8" />
						</div>
					)}
					<div className="flex gap-2">
						<input
							ref={heroInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) heroUploader.handleFile(file);
								e.target.value = '';
							}}
						/>
						<Button
							size="sm"
							variant="outline"
							disabled={heroUploader.uploading}
							onClick={() => heroInputRef.current?.click()}
						>
							{heroUploader.uploading
								? m.admin_cc_settings_image_uploading()
								: m.admin_cc_settings_hero_upload()}
						</Button>
						{heroUrl && (
							<Button
								size="sm"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								onClick={async () => {
									if (!mallId) return;
									setHeroUrl(null);
									await updateImages.mutateAsync({
										mallId,
										heroImageUrl: null,
									});
								}}
							>
								{m.admin_cc_settings_hero_remove()}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Gallery */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_gallery()}</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						JPG, PNG, WebP · máx. 5 MB por imagen
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{gallery.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{m.admin_cc_settings_gallery_empty()}
						</p>
					) : (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
							{gallery.map((img) => (
								<div
									key={img.id}
									className="group relative rounded-md overflow-hidden border"
								>
									<img
										src={img.imageUrl}
										alt={img.label ?? ''}
										className="h-28 w-full object-cover bg-muted"
									/>
									<button
										type="button"
										onClick={() =>
											mallId
												? deleteGalleryImage.mutate({
														mallId,
														imageId: img.id,
													})
												: undefined
										}
										className={cn(
											'absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100',
										)}
									>
										<HugeiconsIcon
											icon={Delete01Icon}
											className="size-5 text-white"
										/>
									</button>
								</div>
							))}
						</div>
					)}
					<input
						ref={galleryInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						className="hidden"
						onChange={async (e) => {
							const files = Array.from(e.target.files ?? []);
							for (const file of files) {
								await galleryUploader.handleFile(file);
							}
							e.target.value = '';
						}}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={galleryUploader.uploading}
						onClick={() => galleryInputRef.current?.click()}
					>
						<HugeiconsIcon icon={ImageUploadIcon} className="size-4" />
						{galleryUploader.uploading
							? m.admin_cc_settings_image_uploading()
							: m.admin_cc_settings_gallery_add()}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
