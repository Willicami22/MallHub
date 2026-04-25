import { ArrowLeft01Icon, Building04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MallStatusBadge } from '@/features/admin-platform/malls/components/mall-status-badge';
import {
	getMallUpsertFormDefaultValues,
	MALL_UPSERT_FORM_OPTIONS,
	toMallUpsertSubmitData,
	useMallUpsertForm,
} from '@/features/admin-platform/malls/components/mall-upsert.form';
import {
	SUSPEND_MALL_FORM_OPTIONS,
	toSuspendMallSubmitData,
	useSuspendMallForm,
} from '@/features/admin-platform/malls/components/suspend-mall.form';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-mall-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_mall_detail_meta_title() },
	{ name: 'description', content: m.admin_mall_detail_meta_description() },
];

export default function AdminMallDetailRoute({ params }: Route.ComponentProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const mallId = params.mallId;
	const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
	const [formInitializedForMallId, setFormInitializedForMallId] = useState<
		string | null
	>(null);

	const mallQuery = useQuery(
		trpc.adminMalls.get.queryOptions({
			mallId,
		}),
	);

	const adminCcUsersQuery = useQuery(
		trpc.adminUsers.list.queryOptions({
			page: 1,
			pageSize: 100,
			roleFilter: appRoles.ADMIN_CC,
			sortBy: 'name',
			sortDirection: 'asc',
		}),
	);

	const mall = mallQuery.data?.mall;
	const assignableAdminCcUsers = useMemo(
		() => (adminCcUsersQuery.data?.users ?? []).filter((user) => !user.banned),
		[adminCcUsersQuery.data?.users],
	);
	const adminCcItems = useMemo(
		() => [
			{
				value: 'UNASSIGNED',
				label: m.admin_malls_admin_cc_unassigned(),
			},
			...assignableAdminCcUsers.map((user) => ({
				value: user.id,
				label: `${user.name} (${user.email})`,
			})),
		],
		[assignableAdminCcUsers],
	);

	const invalidateMalls = async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminMalls.pathKey(),
		});
	};

	const updateMallMutation = useMutation(
		trpc.adminMalls.update.mutationOptions(),
	);

	const activateMallMutation = useMutation(
		trpc.adminMalls.activate.mutationOptions({
			onSuccess: invalidateMalls,
		}),
	);

	const reactivateMallMutation = useMutation(
		trpc.adminMalls.reactivate.mutationOptions({
			onSuccess: invalidateMalls,
		}),
	);

	const suspendMallMutation = useMutation(
		trpc.adminMalls.suspend.mutationOptions({
			onSuccess: async () => {
				await invalidateMalls();
			},
		}),
	);

	const updateMallForm = useMallUpsertForm({
		...MALL_UPSERT_FORM_OPTIONS,
		defaultValues: getMallUpsertFormDefaultValues(),
		onSubmit: async ({ value }) => {
			if (!mall) {
				return;
			}

			const submitData = toMallUpsertSubmitData(value);
			if (!submitData) {
				return;
			}

			await updateMallMutation.mutateAsync({
				mallId: mall.id,
				name: submitData.name,
				city: submitData.city,
				address: submitData.address,
				description: submitData.description,
				adminCcUserId: submitData.adminCcUserId,
			});

			await invalidateMalls();
			updateMallForm.setFieldValue('name', submitData.name);
			updateMallForm.setFieldValue('city', submitData.city);
			updateMallForm.setFieldValue('address', submitData.address);
			updateMallForm.setFieldValue('description', submitData.description ?? '');
			updateMallForm.setFieldValue(
				'adminCcUserId',
				submitData.adminCcUserId ?? '',
			);
		},
	});

	const suspendMallForm = useSuspendMallForm({
		...SUSPEND_MALL_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			if (!mall) {
				return;
			}

			const submitData = toSuspendMallSubmitData(value);
			if (!submitData) {
				return;
			}

			await suspendMallMutation.mutateAsync({
				mallId: mall.id,
				reason: submitData.reason,
			});
			formApi.reset();
			setSuspendDialogOpen(false);
		},
	});

	useEffect(() => {
		if (!mall || formInitializedForMallId === mall.id) {
			return;
		}

		updateMallForm.setFieldValue('name', mall.name);
		updateMallForm.setFieldValue('city', mall.city);
		updateMallForm.setFieldValue('address', mall.address);
		updateMallForm.setFieldValue('description', mall.description ?? '');
		updateMallForm.setFieldValue('adminCcUserId', mall.adminCcUserId ?? '');
		setFormInitializedForMallId(mall.id);
	}, [formInitializedForMallId, mall, updateMallForm]);

	const handleUpdateMallSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void updateMallForm.handleSubmit();
	};

	const handleSuspendMallSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void suspendMallForm.handleSubmit();
	};

	if (mallQuery.isLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardContent className="py-12">
						<div className="flex items-center justify-center">
							<Spinner />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!mall) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_malls_not_found_title()}</CardTitle>
						<CardDescription>
							{m.admin_malls_not_found_description()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/malls')} />}
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
							{m.admin_malls_back_to_list()}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4">
				<Button
					variant="outline"
					size="sm"
					className="w-fit"
					nativeButton={false}
					render={<Link to={localizeHref('/admin/malls')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.admin_malls_back_to_list()}
				</Button>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={Building04Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{mall.name}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_mall_detail_subtitle({ city: mall.city })}
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_mall_detail_edit_title()}</CardTitle>
						<CardDescription>
							{m.admin_mall_detail_edit_description()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleUpdateMallSubmit} className="grid gap-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<updateMallForm.Field name="name">
									{(nameField) => {
										const isInvalid =
											nameField.state.meta.isTouched &&
											!nameField.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-mall-name">
													{m.admin_malls_form_name_label()}
												</FieldLabel>
												<Input
													id="edit-mall-name"
													value={nameField.state.value}
													onChange={(event) =>
														nameField.handleChange(event.target.value)
													}
													onBlur={nameField.handleBlur}
													placeholder={m.admin_malls_form_name_placeholder()}
													aria-invalid={isInvalid}
													disabled={updateMallMutation.isPending}
													required
												/>
												<FieldError errors={nameField.state.meta.errors} />
											</Field>
										);
									}}
								</updateMallForm.Field>

								<updateMallForm.Field name="city">
									{(cityField) => {
										const isInvalid =
											cityField.state.meta.isTouched &&
											!cityField.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-mall-city">
													{m.admin_malls_form_city_label()}
												</FieldLabel>
												<Input
													id="edit-mall-city"
													value={cityField.state.value}
													onChange={(event) =>
														cityField.handleChange(event.target.value)
													}
													onBlur={cityField.handleBlur}
													placeholder={m.admin_malls_form_city_placeholder()}
													aria-invalid={isInvalid}
													disabled={updateMallMutation.isPending}
													required
												/>
												<FieldError errors={cityField.state.meta.errors} />
											</Field>
										);
									}}
								</updateMallForm.Field>

								<updateMallForm.Field name="address">
									{(addressField) => {
										const isInvalid =
											addressField.state.meta.isTouched &&
											!addressField.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-mall-address">
													{m.admin_malls_form_address_label()}
												</FieldLabel>
												<Input
													id="edit-mall-address"
													value={addressField.state.value}
													onChange={(event) =>
														addressField.handleChange(event.target.value)
													}
													onBlur={addressField.handleBlur}
													placeholder={m.admin_malls_form_address_placeholder()}
													aria-invalid={isInvalid}
													disabled={updateMallMutation.isPending}
													required
												/>
												<FieldError errors={addressField.state.meta.errors} />
											</Field>
										);
									}}
								</updateMallForm.Field>

								<updateMallForm.Field name="adminCcUserId">
									{(adminCcUserIdField) => {
										const isInvalid =
											adminCcUserIdField.state.meta.isTouched &&
											!adminCcUserIdField.state.meta.isValid;
										const selectedValue = adminCcUserIdField.state.value.length
											? adminCcUserIdField.state.value
											: 'UNASSIGNED';

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel>
													{m.admin_malls_form_admin_cc_label()}
												</FieldLabel>
												<Select
													items={adminCcItems}
													value={selectedValue}
													onValueChange={(value) =>
														adminCcUserIdField.handleChange(
															value === null || value === 'UNASSIGNED'
																? ''
																: value,
														)
													}
													disabled={
														updateMallMutation.isPending ||
														adminCcUsersQuery.isLoading
													}
												>
													<SelectTrigger aria-invalid={isInvalid}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{adminCcItems.map((item) => (
															<SelectItem key={item.value} value={item.value}>
																{item.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldError
													errors={adminCcUserIdField.state.meta.errors}
												/>
											</Field>
										);
									}}
								</updateMallForm.Field>

								<updateMallForm.Field name="description">
									{(descriptionField) => {
										const isInvalid =
											descriptionField.state.meta.isTouched &&
											!descriptionField.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-mall-description">
													{m.admin_malls_form_description_label()}
												</FieldLabel>
												<Input
													id="edit-mall-description"
													value={descriptionField.state.value}
													onChange={(event) =>
														descriptionField.handleChange(event.target.value)
													}
													onBlur={descriptionField.handleBlur}
													placeholder={m.admin_malls_form_description_placeholder()}
													aria-invalid={isInvalid}
													disabled={updateMallMutation.isPending}
												/>
												<FieldError
													errors={descriptionField.state.meta.errors}
												/>
											</Field>
										);
									}}
								</updateMallForm.Field>
							</div>

							<div className="flex items-center justify-end gap-2">
								<Button type="submit" disabled={updateMallMutation.isPending}>
									{updateMallMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_mall_detail_save_submitting()}
										</>
									) : (
										m.admin_mall_detail_save_button()
									)}
								</Button>
							</div>
							{updateMallMutation.error ? (
								<p className="text-sm text-destructive">
									{updateMallMutation.error.message}
								</p>
							) : null}
						</form>
					</CardContent>
				</Card>

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_mall_detail_status_title()}</CardTitle>
							<CardDescription>
								{m.admin_mall_detail_status_description()}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{m.admin_malls_column_status()}
								</span>
								<MallStatusBadge status={mall.status} />
							</div>

							{mall.activationReadiness.isReady ? (
								<p className="text-sm text-muted-foreground">
									{m.admin_mall_detail_activation_ready()}
								</p>
							) : (
								<div className="rounded-md border border-dashed p-3">
									<p className="text-sm font-medium text-foreground">
										{m.admin_mall_detail_activation_missing_title()}
									</p>
									<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
										{mall.activationReadiness.missingRequirements.map(
											(requirement) => (
												<li key={requirement.code}>- {requirement.label}</li>
											),
										)}
									</ul>
								</div>
							)}

							{mall.status === 'INACTIVE' ? (
								<Button
									className="w-full"
									onClick={() => {
										void activateMallMutation.mutateAsync({ mallId: mall.id });
									}}
									disabled={activateMallMutation.isPending}
								>
									{activateMallMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_mall_detail_activate_submitting()}
										</>
									) : (
										m.admin_mall_detail_activate_button()
									)}
								</Button>
							) : null}

							{mall.status === 'ACTIVE' ? (
								<Button
									variant="destructive"
									className="w-full"
									onClick={() => setSuspendDialogOpen(true)}
								>
									{m.admin_mall_detail_suspend_button()}
								</Button>
							) : null}

							{mall.status === 'SUSPENDED' ? (
								<Button
									className="w-full"
									onClick={() => {
										void reactivateMallMutation.mutateAsync({
											mallId: mall.id,
										});
									}}
									disabled={reactivateMallMutation.isPending}
								>
									{reactivateMallMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_mall_detail_reactivate_submitting()}
										</>
									) : (
										m.admin_mall_detail_reactivate_button()
									)}
								</Button>
							) : null}

							{activateMallMutation.error ? (
								<p className="text-sm text-destructive">
									{activateMallMutation.error.message}
								</p>
							) : null}
							{reactivateMallMutation.error ? (
								<p className="text-sm text-destructive">
									{reactivateMallMutation.error.message}
								</p>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{m.admin_mall_detail_summary_title()}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_malls_column_active_stores()}
								</span>
								<Badge variant="secondary">{mall.activeStoreCount}</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_mall_detail_total_stores()}
								</span>
								<Badge variant="outline">{mall.totalStoreCount}</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_mall_detail_pending_requests()}
								</span>
								<Badge variant="outline">
									{mall.pendingStoreRegistrationCount}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_malls_column_admin_cc()}
								</span>
								<span className="font-medium">
									{mall.adminCcUser
										? mall.adminCcUser.name
										: m.admin_malls_admin_cc_unassigned()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_malls_column_created_at()}
								</span>
								<span>{new Date(mall.createdAt).toLocaleDateString()}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog
				open={suspendDialogOpen}
				onOpenChange={(nextOpen) => {
					setSuspendDialogOpen(nextOpen);
					if (!nextOpen) {
						suspendMallForm.reset();
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{m.admin_mall_detail_suspend_dialog_title()}
						</DialogTitle>
						<DialogDescription>
							{m.admin_mall_detail_suspend_dialog_description({
								name: mall.name,
							})}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSuspendMallSubmit} className="space-y-5">
						<suspendMallForm.Field name="reason">
							{(reasonField) => {
								const isInvalid =
									reasonField.state.meta.isTouched &&
									!reasonField.state.meta.isValid;

								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="suspend-mall-reason">
											{m.admin_mall_detail_suspend_reason_label()}
										</FieldLabel>
										<Input
											id="suspend-mall-reason"
											value={reasonField.state.value}
											onChange={(event) =>
												reasonField.handleChange(event.target.value)
											}
											onBlur={reasonField.handleBlur}
											placeholder={m.admin_mall_detail_suspend_reason_placeholder()}
											aria-invalid={isInvalid}
											disabled={suspendMallMutation.isPending}
										/>
										<FieldError errors={reasonField.state.meta.errors} />
									</Field>
								);
							}}
						</suspendMallForm.Field>
						{suspendMallMutation.error ? (
							<p className="text-sm text-destructive">
								{suspendMallMutation.error.message}
							</p>
						) : null}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setSuspendDialogOpen(false)}
							>
								{m.admin_malls_cancel()}
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={suspendMallMutation.isPending}
							>
								{suspendMallMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_mall_detail_suspend_submitting()}
									</>
								) : (
									m.admin_mall_detail_suspend_confirm()
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
