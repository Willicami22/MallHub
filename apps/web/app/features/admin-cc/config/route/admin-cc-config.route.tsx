import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Separator,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import {
	DEFAULT_VALUES,
	type MallSettingsCategory,
	type MallSettingsFormState,
	type MallSettingsHour,
	mallSettingsFormOptions,
	useMallSettingsForm,
} from '../mall-settings.form';
import type { Route } from './+types/admin-cc-config.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: 'Configuración | Admin CC' }];
}

export default function AdminCcConfigRoute() {
	const trpc = useTRPC();

	// 1. Fetch de la config (Mock)
	const {
		data: initialData,
		isLoading,
		isError,
	} = useQuery(trpc.adminCc.config.getConfig.queryOptions());

	// 2. Transición y Hook del Formulario
	const mutation = useMutation(
		trpc.adminCc.config.updateConfig.mutationOptions({
			onSuccess: () => {
				toast(m.admin_cc_settings_saved());
			},
			onError: () => {
				toast.error('Error guardando');
			},
		}),
	);

	const form = useMallSettingsForm({
		...mallSettingsFormOptions,
		defaultValues: initialData
			? ({
					name: initialData.name,
					description: initialData.description,
					address: initialData.address,
					hours: initialData.hours || [],
					categories: initialData.categories || [],
				} as MallSettingsFormState)
			: DEFAULT_VALUES,
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	if (isLoading)
		return (
			<div className="p-8 text-center text-muted-foreground">
				Cargando configuración...
			</div>
		);
	if (isError)
		return (
			<div className="p-8 text-center text-red-500">
				Error al cargar la configuración.
			</div>
		);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6 max-w-4xl pb-10"
		>
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{m.admin_cc_settings_title()}
				</h1>
				<p className="text-muted-foreground">
					{m.admin_cc_settings_subtitle()}
				</p>
			</div>

			{/* 1. Información general */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_general()}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{m.admin_cc_settings_general_name()}
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors ? (
									<p className="text-[13px] font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								) : null}
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
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="address">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{m.admin_cc_settings_general_address()}
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors ? (
									<p className="text-[13px] font-medium text-destructive">
										{field.state.meta.errors.join(', ')}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<Separator className="my-4" />

					<div className="space-y-2">
						<Label>Horarios</Label>
						<form.Field name="hours" mode="array">
							{(field) => (
								<div className="space-y-3">
									{field.state.value.map(
										(hour: MallSettingsHour, index: number) => (
											<div key={hour.day} className="flex gap-4 items-center">
												<div className="w-24 font-medium text-sm">
													{hour.day}
												</div>
												<form.Field name={`hours[${index}].open`}>
													{(subField) => (
														<Input
															type="time"
															value={subField.state.value}
															onChange={(e) =>
																subField.handleChange(e.target.value)
															}
															className="w-32"
														/>
													)}
												</form.Field>
												<span className="text-muted-foreground">a</span>
												<form.Field name={`hours[${index}].close`}>
													{(subField) => (
														<Input
															type="time"
															value={subField.state.value}
															onChange={(e) =>
																subField.handleChange(e.target.value)
															}
															className="w-32"
														/>
													)}
												</form.Field>
											</div>
										),
									)}
								</div>
							)}
						</form.Field>
					</div>
				</CardContent>
			</Card>

			{/* 2. Categorías (Estructura Básica Array) */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_categories()}</CardTitle>
				</CardHeader>
				<CardContent>
					<form.Field name="categories" mode="array">
						{(field) => (
							<div className="space-y-2">
								{field.state.value.map(
									(cat: MallSettingsCategory, i: number) => (
										<div key={cat.id} className="flex items-center gap-2">
											<Input
												value={cat.name}
												onChange={(e) => {
													const next = [...field.state.value];
													next[i] = { ...cat, name: e.target.value };
													field.handleChange(next);
												}}
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													field.handleChange(
														field.state.value.filter(
															(_: MallSettingsCategory, idx: number) =>
																idx !== i,
														),
													);
												}}
											>
												X
											</Button>
										</div>
									),
								)}
								<Button
									type="button"
									variant="secondary"
									onClick={() =>
										field.handleChange([
											...field.state.value,
											{ id: Date.now().toString(), name: '' },
										])
									}
								>
									+ Agregar Categoría
								</Button>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			{/* 3. Imágenes (Mock / UI dummy) */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_images()}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-8 border-2 border-dashed rounded text-center text-muted-foreground w-full">
						Área para cargar Logo
					</div>
					<div className="p-12 border-2 border-dashed rounded text-center text-muted-foreground w-full">
						Área para cargar Banner Principal
					</div>
				</CardContent>
			</Card>

			{/* 4. Mapa SVG (Mock / UI dummy) */}
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_cc_settings_map()}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="p-12 border-2 border-dashed rounded text-center text-muted-foreground w-full">
						Área para gestionar y reemplazar el Mapa SVG
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-end">
				<form.Subscribe
					selector={(state) => [state.isSubmitting, state.canSubmit]}
				>
					{([isSubmitting, canSubmit]) => (
						<Button type="submit" disabled={isSubmitting || !canSubmit}>
							{isSubmitting
								? m.admin_cc_settings_saving()
								: m.admin_cc_settings_save()}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
