import { ArrowLeft01Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
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
	Spinner,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { StoreStatusBadge } from '@/features/admin-platform/stores/components/store-status-badge';
import {
	SUSPEND_STORE_FORM_OPTIONS,
	toSuspendStoreSubmitData,
	useSuspendStoreForm,
} from '@/features/admin-platform/stores/components/suspend-store.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-store-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_store_detail_meta_title() },
	{ name: 'description', content: m.admin_store_detail_meta_description() },
];

export default function AdminStoreDetailRoute({
	params,
}: Route.ComponentProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const storeId = params.storeId;
	const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

	const storeQuery = useQuery(
		trpc.adminStores.get.queryOptions({
			storeId,
		}),
	);

	const invalidateStores = async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminStores.pathKey(),
		});
	};

	const suspendStoreMutation = useMutation(
		trpc.adminStores.suspend.mutationOptions({
			onSuccess: async () => {
				await invalidateStores();
			},
		}),
	);

	const reactivateStoreMutation = useMutation(
		trpc.adminStores.reactivate.mutationOptions({
			onSuccess: invalidateStores,
		}),
	);

	const suspendStoreForm = useSuspendStoreForm({
		...SUSPEND_STORE_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const store = storeQuery.data?.store;
			if (!store) {
				return;
			}

			const submitData = toSuspendStoreSubmitData(value);
			if (!submitData) {
				return;
			}

			await suspendStoreMutation.mutateAsync({
				storeId: store.id,
				reason: submitData.reason,
			});
			formApi.reset();
			setSuspendDialogOpen(false);
		},
	});

	const handleSuspendStoreSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void suspendStoreForm.handleSubmit();
	};

	if (storeQuery.isLoading) {
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

	const store = storeQuery.data?.store;
	if (!store) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_stores_not_found_title()}</CardTitle>
						<CardDescription>
							{m.admin_stores_not_found_description()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/stores')} />}
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
							{m.admin_store_detail_back_to_list()}
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
					render={<Link to={localizeHref('/admin/stores')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.admin_store_detail_back_to_list()}
				</Button>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={ShoppingBag01Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{store.name}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_store_detail_subtitle({ mallName: store.mall.name })}
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_store_detail_information_title()}</CardTitle>
						<CardDescription>
							{m.admin_store_detail_information_description()}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_store_detail_field_mall()}
							</span>
							<span className="text-right font-medium">
								{store.mall.name} ({store.mall.city})
							</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_store_detail_field_owner()}
							</span>
							<span className="text-right font-medium">
								{store.owner
									? `${store.owner.name} (${store.owner.email})`
									: m.admin_stores_owner_unassigned()}
							</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_store_detail_field_category()}
							</span>
							<span className="text-right font-medium">
								{store.category ?? m.admin_store_detail_missing_value()}
							</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_store_detail_field_contact_email()}
							</span>
							<span className="text-right font-medium">
								{store.contactEmail ?? m.admin_store_detail_missing_value()}
							</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_store_detail_field_contact_phone()}
							</span>
							<span className="text-right font-medium">
								{store.phone ?? m.admin_store_detail_missing_value()}
							</span>
						</div>
						<div className="space-y-1">
							<span className="text-muted-foreground">
								{m.admin_store_detail_field_description()}
							</span>
							<p className="rounded-md border bg-muted/40 px-3 py-2 text-foreground">
								{store.description ?? m.admin_store_detail_missing_value()}
							</p>
						</div>
					</CardContent>
				</Card>

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_store_detail_status_title()}</CardTitle>
							<CardDescription>
								{m.admin_store_detail_status_description()}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{m.admin_stores_column_status()}
								</span>
								<StoreStatusBadge status={store.status} />
							</div>

							{store.status === 'PENDING_APPROVAL' ? (
								<p className="text-sm text-muted-foreground">
									{m.admin_store_detail_pending_review_hint()}
								</p>
							) : null}

							{store.status === 'REJECTED' ? (
								<p className="text-sm text-muted-foreground">
									{m.admin_store_detail_rejected_hint()}
								</p>
							) : null}

							{store.status === 'ACTIVE' ? (
								<Button
									variant="destructive"
									className="w-full"
									onClick={() => setSuspendDialogOpen(true)}
								>
									{m.admin_store_detail_suspend_button()}
								</Button>
							) : null}

							{store.status === 'SUSPENDED' ? (
								<Button
									className="w-full"
									onClick={() => {
										void reactivateStoreMutation.mutateAsync({
											storeId: store.id,
										});
									}}
									disabled={reactivateStoreMutation.isPending}
								>
									{reactivateStoreMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_store_detail_reactivate_submitting()}
										</>
									) : (
										m.admin_store_detail_reactivate_button()
									)}
								</Button>
							) : null}

							{reactivateStoreMutation.error ? (
								<p className="text-sm text-destructive">
									{reactivateStoreMutation.error.message}
								</p>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{m.admin_store_detail_summary_title()}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_store_detail_summary_plan()}
								</span>
								<span className="font-medium">
									{m.admin_stores_plan_not_configured()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_store_detail_summary_created()}
								</span>
								<span>{new Date(store.createdAt).toLocaleDateString()}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{m.admin_store_detail_summary_updated()}
								</span>
								<span>{new Date(store.updatedAt).toLocaleDateString()}</span>
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
						suspendStoreForm.reset();
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{m.admin_store_detail_suspend_dialog_title()}
						</DialogTitle>
						<DialogDescription>
							{m.admin_store_detail_suspend_dialog_description({
								name: store.name,
							})}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSuspendStoreSubmit} className="space-y-5">
						<suspendStoreForm.Field name="reason">
							{(reasonField) => {
								const isInvalid =
									reasonField.state.meta.isTouched &&
									!reasonField.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="suspend-store-reason">
											{m.admin_store_detail_suspend_reason_label()}
										</FieldLabel>
										<Input
											id="suspend-store-reason"
											value={reasonField.state.value}
											onChange={(event) =>
												reasonField.handleChange(event.target.value)
											}
											onBlur={reasonField.handleBlur}
											placeholder={m.admin_store_detail_suspend_reason_placeholder()}
											aria-invalid={isInvalid}
											disabled={suspendStoreMutation.isPending}
										/>
										<FieldError errors={reasonField.state.meta.errors} />
									</Field>
								);
							}}
						</suspendStoreForm.Field>
						{suspendStoreMutation.error ? (
							<p className="text-sm text-destructive">
								{suspendStoreMutation.error.message}
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
								disabled={suspendStoreMutation.isPending}
							>
								{suspendStoreMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_store_detail_suspend_submitting()}
									</>
								) : (
									m.admin_store_detail_suspend_confirm()
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
