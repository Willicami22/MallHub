import { ArrowLeft01Icon, TaskDone02Icon } from '@hugeicons/core-free-icons';
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
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
	getMallProfileCorrectionFormDefaultValues,
	MALL_PROFILE_CORRECTION_FORM_OPTIONS,
	toMallProfileCorrectionSubmitData,
	useMallProfileCorrectionForm,
} from '@/features/admin-platform/moderation/components/mall-profile-correction.form';
import {
	MODERATION_REASON_FORM_OPTIONS,
	toModerationReasonSubmitData,
	useModerationReasonForm,
} from '@/features/admin-platform/moderation/components/moderation-reason.form';
import { ModerationReportStatusBadge } from '@/features/admin-platform/moderation/components/moderation-report-status-badge';
import { getModerationReportTargetLabel } from '@/features/admin-platform/moderation/components/moderation-report-target-label.lib';
import {
	getStoreProfileCorrectionFormDefaultValues,
	STORE_PROFILE_CORRECTION_FORM_OPTIONS,
	toStoreProfileCorrectionSubmitData,
	useStoreProfileCorrectionForm,
} from '@/features/admin-platform/moderation/components/store-profile-correction.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-moderation-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_moderation_detail_meta_title() },
	{
		name: 'description',
		content: m.admin_moderation_detail_meta_description(),
	},
];

export default function AdminModerationDetailRoute({
	params,
}: Route.ComponentProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const reportId = params.reportId;
	const [storeFormInitializedForReportId, setStoreFormInitializedForReportId] =
		useState<string | null>(null);
	const [mallFormInitializedForReportId, setMallFormInitializedForReportId] =
		useState<string | null>(null);

	const reportQuery = useQuery(
		trpc.adminModeration.get.queryOptions({
			reportId,
		}),
	);

	const invalidateModeration = async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminModeration.pathKey(),
		});
	};

	const dismissReportMutation = useMutation(
		trpc.adminModeration.dismiss.mutationOptions({
			onSuccess: invalidateModeration,
		}),
	);
	const removeProductMutation = useMutation(
		trpc.adminModeration.removeProduct.mutationOptions({
			onSuccess: invalidateModeration,
		}),
	);
	const correctStoreProfileMutation = useMutation(
		trpc.adminModeration.correctStoreProfile.mutationOptions({
			onSuccess: invalidateModeration,
		}),
	);
	const correctMallProfileMutation = useMutation(
		trpc.adminModeration.correctMallProfile.mutationOptions({
			onSuccess: invalidateModeration,
		}),
	);
	const removeStoreImageMutation = useMutation(
		trpc.adminModeration.removeStoreImage.mutationOptions({
			onSuccess: invalidateModeration,
		}),
	);
	const removeMallImageMutation = useMutation(
		trpc.adminModeration.removeMallImage.mutationOptions({
			onSuccess: invalidateModeration,
		}),
	);

	const dismissReasonForm = useModerationReasonForm({
		...MODERATION_REASON_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const report = reportQuery.data?.report;
			if (!report) {
				return;
			}

			const submitData = toModerationReasonSubmitData(value);
			if (!submitData) {
				return;
			}

			await dismissReportMutation.mutateAsync({
				reportId: report.id,
				reason: submitData.reason,
			});
			formApi.reset();
		},
	});
	const removeProductReasonForm = useModerationReasonForm({
		...MODERATION_REASON_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const report = reportQuery.data?.report;
			if (!report || report.targetType !== 'PRODUCT') {
				return;
			}

			const submitData = toModerationReasonSubmitData(value);
			if (!submitData) {
				return;
			}

			await removeProductMutation.mutateAsync({
				reportId: report.id,
				reason: submitData.reason,
			});
			formApi.reset();
		},
	});
	const removeStoreImageReasonForm = useModerationReasonForm({
		...MODERATION_REASON_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const report = reportQuery.data?.report;
			if (!report || report.targetType !== 'STORE_IMAGE') {
				return;
			}

			const submitData = toModerationReasonSubmitData(value);
			if (!submitData) {
				return;
			}

			await removeStoreImageMutation.mutateAsync({
				reportId: report.id,
				reason: submitData.reason,
			});
			formApi.reset();
		},
	});
	const removeMallImageReasonForm = useModerationReasonForm({
		...MODERATION_REASON_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const report = reportQuery.data?.report;
			if (!report || report.targetType !== 'MALL_IMAGE') {
				return;
			}

			const submitData = toModerationReasonSubmitData(value);
			if (!submitData) {
				return;
			}

			await removeMallImageMutation.mutateAsync({
				reportId: report.id,
				reason: submitData.reason,
			});
			formApi.reset();
		},
	});
	const storeProfileCorrectionForm = useStoreProfileCorrectionForm({
		...STORE_PROFILE_CORRECTION_FORM_OPTIONS,
		defaultValues: getStoreProfileCorrectionFormDefaultValues(),
		onSubmit: async ({ value }) => {
			const report = reportQuery.data?.report;
			if (!report || report.targetType !== 'STORE_PROFILE' || !report.store) {
				return;
			}

			const submitData = toStoreProfileCorrectionSubmitData(value);
			if (!submitData) {
				return;
			}

			await correctStoreProfileMutation.mutateAsync({
				reportId: report.id,
				reason: submitData.reason,
				name: submitData.name,
				category: submitData.category,
				description: submitData.description,
				contactEmail: submitData.contactEmail,
				phone: submitData.phone,
			});
		},
	});
	const mallProfileCorrectionForm = useMallProfileCorrectionForm({
		...MALL_PROFILE_CORRECTION_FORM_OPTIONS,
		defaultValues: getMallProfileCorrectionFormDefaultValues(),
		onSubmit: async ({ value }) => {
			const report = reportQuery.data?.report;
			if (!report || report.targetType !== 'MALL_PROFILE' || !report.mall) {
				return;
			}

			const submitData = toMallProfileCorrectionSubmitData(value);
			if (!submitData) {
				return;
			}

			await correctMallProfileMutation.mutateAsync({
				reportId: report.id,
				reason: submitData.reason,
				name: submitData.name,
				city: submitData.city,
				address: submitData.address,
				description: submitData.description,
			});
		},
	});

	const report = reportQuery.data?.report;
	const isOpen = report?.status === 'OPEN';

	useEffect(() => {
		if (
			!report ||
			report.targetType !== 'STORE_PROFILE' ||
			!report.store ||
			storeFormInitializedForReportId === report.id
		) {
			return;
		}

		storeProfileCorrectionForm.setFieldValue('name', report.store.name);
		storeProfileCorrectionForm.setFieldValue(
			'category',
			report.store.category ?? '',
		);
		storeProfileCorrectionForm.setFieldValue(
			'description',
			report.store.description ?? '',
		);
		storeProfileCorrectionForm.setFieldValue(
			'contactEmail',
			report.store.contactEmail ?? '',
		);
		storeProfileCorrectionForm.setFieldValue('phone', report.store.phone ?? '');
		setStoreFormInitializedForReportId(report.id);
	}, [report, storeFormInitializedForReportId, storeProfileCorrectionForm]);

	useEffect(() => {
		if (
			!report ||
			report.targetType !== 'MALL_PROFILE' ||
			!report.mall ||
			mallFormInitializedForReportId === report.id
		) {
			return;
		}

		mallProfileCorrectionForm.setFieldValue('name', report.mall.name);
		mallProfileCorrectionForm.setFieldValue('city', report.mall.city);
		mallProfileCorrectionForm.setFieldValue('address', report.mall.address);
		mallProfileCorrectionForm.setFieldValue(
			'description',
			report.mall.description ?? '',
		);
		setMallFormInitializedForReportId(report.id);
	}, [mallFormInitializedForReportId, mallProfileCorrectionForm, report]);

	const handleDismissReportSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void dismissReasonForm.handleSubmit();
	};
	const handleRemoveProductSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void removeProductReasonForm.handleSubmit();
	};
	const handleRemoveStoreImageSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void removeStoreImageReasonForm.handleSubmit();
	};
	const handleRemoveMallImageSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void removeMallImageReasonForm.handleSubmit();
	};
	const handleStoreProfileCorrectionSubmit = (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		void storeProfileCorrectionForm.handleSubmit();
	};
	const handleMallProfileCorrectionSubmit = (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		void mallProfileCorrectionForm.handleSubmit();
	};

	if (reportQuery.isLoading) {
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

	if (!report) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_moderation_not_found_title()}</CardTitle>
						<CardDescription>
							{m.admin_moderation_not_found_description()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/moderation')} />}
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
							{m.admin_moderation_back_to_list()}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const targetLabel = getModerationReportTargetLabel(report.targetType);
	const targetName =
		report.product?.name ??
		report.store?.name ??
		report.mall?.name ??
		m.admin_moderation_target_unknown();

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4">
				<Button
					variant="outline"
					size="sm"
					className="w-fit"
					nativeButton={false}
					render={<Link to={localizeHref('/admin/moderation')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.admin_moderation_back_to_list()}
				</Button>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={TaskDone02Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.admin_moderation_detail_title()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{m.admin_moderation_detail_subtitle({ target: targetName })}
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_moderation_detail_report_title()}</CardTitle>
						<CardDescription>
							{m.admin_moderation_detail_report_description()}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_moderation_column_target()}
							</span>
							<span className="text-right font-medium">{targetName}</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_moderation_column_type()}
							</span>
							<span className="text-right font-medium">{targetLabel}</span>
						</div>
						<div className="space-y-1">
							<span className="text-muted-foreground">
								{m.admin_moderation_column_reason()}
							</span>
							<p className="rounded-md border bg-muted/40 px-3 py-2 text-foreground">
								{report.reason}
							</p>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_moderation_column_reported_by()}
							</span>
							<span className="text-right font-medium">
								{report.reportedByUser
									? `${report.reportedByUser.name} (${report.reportedByUser.email})`
									: m.admin_moderation_reported_by_unknown()}
							</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{m.admin_moderation_column_created_at()}
							</span>
							<span>{new Date(report.createdAt).toLocaleString()}</span>
						</div>
					</CardContent>
				</Card>

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_moderation_detail_status_title()}</CardTitle>
							<CardDescription>
								{m.admin_moderation_detail_status_description()}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{m.admin_moderation_column_status()}
								</span>
								<ModerationReportStatusBadge status={report.status} />
							</div>

							{report.status !== 'OPEN' ? (
								<div className="space-y-2 rounded-md border p-3 text-sm">
									<p className="font-medium text-foreground">
										{m.admin_moderation_detail_resolution_title()}
									</p>
									<p className="text-muted-foreground">
										{report.resolutionAction ??
											m.admin_moderation_detail_resolution_unknown()}
									</p>
									{report.resolutionReason ? (
										<p className="text-muted-foreground">
											{m.admin_moderation_detail_resolution_reason({
												reason: report.resolutionReason,
											})}
										</p>
									) : null}
									{report.reviewedAt ? (
										<p className="text-muted-foreground">
											{m.admin_moderation_detail_resolution_reviewed_at({
												at: new Date(report.reviewedAt).toLocaleString(),
											})}
										</p>
									) : null}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_status_open_hint()}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>{m.admin_moderation_detail_actions_title()}</CardTitle>
					<CardDescription>
						{m.admin_moderation_detail_actions_description()}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{!isOpen ? null : (
						<form onSubmit={handleDismissReportSubmit} className="space-y-4">
							<div className="space-y-1">
								<h3 className="text-sm font-medium text-foreground">
									{m.admin_moderation_action_report_dismissed()}
								</h3>
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_dismiss_description()}
								</p>
							</div>
							<dismissReasonForm.Field name="reason">
								{(reasonField) => {
									const isInvalid =
										reasonField.state.meta.isTouched &&
										!reasonField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="dismiss-report-reason">
												{m.admin_moderation_reason_label()}
											</FieldLabel>
											<Input
												id="dismiss-report-reason"
												value={reasonField.state.value}
												onChange={(event) =>
													reasonField.handleChange(event.target.value)
												}
												onBlur={reasonField.handleBlur}
												placeholder={m.admin_moderation_reason_placeholder()}
												aria-invalid={isInvalid}
												disabled={dismissReportMutation.isPending}
											/>
											<FieldError errors={reasonField.state.meta.errors} />
										</Field>
									);
								}}
							</dismissReasonForm.Field>
							<Button
								type="submit"
								variant="outline"
								disabled={dismissReportMutation.isPending}
							>
								{dismissReportMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_moderation_action_submitting()}
									</>
								) : (
									m.admin_moderation_action_dismiss_button()
								)}
							</Button>
							{dismissReportMutation.error ? (
								<p className="text-sm text-destructive">
									{dismissReportMutation.error.message}
								</p>
							) : null}
						</form>
					)}

					{isOpen && report.targetType === 'PRODUCT' ? (
						<form onSubmit={handleRemoveProductSubmit} className="space-y-4">
							<div className="space-y-1">
								<h3 className="text-sm font-medium text-foreground">
									{m.admin_moderation_action_product_removed()}
								</h3>
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_remove_product_description()}
								</p>
							</div>
							<removeProductReasonForm.Field name="reason">
								{(reasonField) => {
									const isInvalid =
										reasonField.state.meta.isTouched &&
										!reasonField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="remove-product-reason">
												{m.admin_moderation_reason_label()}
											</FieldLabel>
											<Input
												id="remove-product-reason"
												value={reasonField.state.value}
												onChange={(event) =>
													reasonField.handleChange(event.target.value)
												}
												onBlur={reasonField.handleBlur}
												placeholder={m.admin_moderation_reason_placeholder()}
												aria-invalid={isInvalid}
												disabled={removeProductMutation.isPending}
											/>
											<FieldError errors={reasonField.state.meta.errors} />
										</Field>
									);
								}}
							</removeProductReasonForm.Field>
							<Button
								type="submit"
								variant="destructive"
								disabled={removeProductMutation.isPending}
							>
								{removeProductMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_moderation_action_submitting()}
									</>
								) : (
									m.admin_moderation_action_remove_product_button()
								)}
							</Button>
							{removeProductMutation.error ? (
								<p className="text-sm text-destructive">
									{removeProductMutation.error.message}
								</p>
							) : null}
						</form>
					) : null}

					{isOpen && report.targetType === 'STORE_PROFILE' ? (
						<form
							onSubmit={handleStoreProfileCorrectionSubmit}
							className="grid gap-4 sm:grid-cols-2"
						>
							<div className="sm:col-span-2 space-y-1">
								<h3 className="text-sm font-medium text-foreground">
									{m.admin_moderation_action_store_profile_corrected()}
								</h3>
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_correct_store_profile_description()}
								</p>
							</div>

							<storeProfileCorrectionForm.Field name="reason">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="store-correction-reason">
											{m.admin_moderation_reason_label()}
										</FieldLabel>
										<Input
											id="store-correction-reason"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											placeholder={m.admin_moderation_reason_placeholder()}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctStoreProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</storeProfileCorrectionForm.Field>
							<storeProfileCorrectionForm.Field name="name">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="store-correction-name">
											{m.admin_moderation_store_name_label()}
										</FieldLabel>
										<Input
											id="store-correction-name"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctStoreProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</storeProfileCorrectionForm.Field>
							<storeProfileCorrectionForm.Field name="category">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="store-correction-category">
											{m.admin_moderation_store_category_label()}
										</FieldLabel>
										<Input
											id="store-correction-category"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctStoreProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</storeProfileCorrectionForm.Field>
							<storeProfileCorrectionForm.Field name="description">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="store-correction-description">
											{m.admin_moderation_store_description_label()}
										</FieldLabel>
										<Input
											id="store-correction-description"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctStoreProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</storeProfileCorrectionForm.Field>
							<storeProfileCorrectionForm.Field name="contactEmail">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="store-correction-contact-email">
											{m.admin_moderation_store_contact_email_label()}
										</FieldLabel>
										<Input
											id="store-correction-contact-email"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctStoreProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</storeProfileCorrectionForm.Field>
							<storeProfileCorrectionForm.Field name="phone">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="store-correction-phone">
											{m.admin_moderation_store_phone_label()}
										</FieldLabel>
										<Input
											id="store-correction-phone"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctStoreProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</storeProfileCorrectionForm.Field>
							<div className="sm:col-span-2">
								<Button
									type="submit"
									disabled={correctStoreProfileMutation.isPending}
								>
									{correctStoreProfileMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_moderation_action_submitting()}
										</>
									) : (
										m.admin_moderation_action_correct_store_profile_button()
									)}
								</Button>
							</div>
							{correctStoreProfileMutation.error ? (
								<p className="sm:col-span-2 text-sm text-destructive">
									{correctStoreProfileMutation.error.message}
								</p>
							) : null}
						</form>
					) : null}

					{isOpen && report.targetType === 'MALL_PROFILE' ? (
						<form
							onSubmit={handleMallProfileCorrectionSubmit}
							className="grid gap-4 sm:grid-cols-2"
						>
							<div className="sm:col-span-2 space-y-1">
								<h3 className="text-sm font-medium text-foreground">
									{m.admin_moderation_action_mall_profile_corrected()}
								</h3>
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_correct_mall_profile_description()}
								</p>
							</div>

							<mallProfileCorrectionForm.Field name="reason">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="mall-correction-reason">
											{m.admin_moderation_reason_label()}
										</FieldLabel>
										<Input
											id="mall-correction-reason"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctMallProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</mallProfileCorrectionForm.Field>
							<mallProfileCorrectionForm.Field name="name">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="mall-correction-name">
											{m.admin_moderation_mall_name_label()}
										</FieldLabel>
										<Input
											id="mall-correction-name"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctMallProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</mallProfileCorrectionForm.Field>
							<mallProfileCorrectionForm.Field name="city">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="mall-correction-city">
											{m.admin_moderation_mall_city_label()}
										</FieldLabel>
										<Input
											id="mall-correction-city"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctMallProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</mallProfileCorrectionForm.Field>
							<mallProfileCorrectionForm.Field name="address">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="mall-correction-address">
											{m.admin_moderation_mall_address_label()}
										</FieldLabel>
										<Input
											id="mall-correction-address"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctMallProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</mallProfileCorrectionForm.Field>
							<mallProfileCorrectionForm.Field name="description">
								{(field) => (
									<Field
										data-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									>
										<FieldLabel htmlFor="mall-correction-description">
											{m.admin_moderation_mall_description_label()}
										</FieldLabel>
										<Input
											id="mall-correction-description"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											aria-invalid={
												field.state.meta.isTouched && !field.state.meta.isValid
											}
											disabled={correctMallProfileMutation.isPending}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</mallProfileCorrectionForm.Field>
							<div className="sm:col-span-2">
								<Button
									type="submit"
									disabled={correctMallProfileMutation.isPending}
								>
									{correctMallProfileMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_moderation_action_submitting()}
										</>
									) : (
										m.admin_moderation_action_correct_mall_profile_button()
									)}
								</Button>
							</div>
							{correctMallProfileMutation.error ? (
								<p className="sm:col-span-2 text-sm text-destructive">
									{correctMallProfileMutation.error.message}
								</p>
							) : null}
						</form>
					) : null}

					{isOpen && report.targetType === 'STORE_IMAGE' ? (
						<form onSubmit={handleRemoveStoreImageSubmit} className="space-y-4">
							<div className="space-y-1">
								<h3 className="text-sm font-medium text-foreground">
									{m.admin_moderation_action_store_image_removed()}
								</h3>
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_remove_store_image_description()}
								</p>
							</div>
							<removeStoreImageReasonForm.Field name="reason">
								{(reasonField) => {
									const isInvalid =
										reasonField.state.meta.isTouched &&
										!reasonField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="remove-store-image-reason">
												{m.admin_moderation_reason_label()}
											</FieldLabel>
											<Input
												id="remove-store-image-reason"
												value={reasonField.state.value}
												onChange={(event) =>
													reasonField.handleChange(event.target.value)
												}
												onBlur={reasonField.handleBlur}
												placeholder={m.admin_moderation_reason_placeholder()}
												aria-invalid={isInvalid}
												disabled={removeStoreImageMutation.isPending}
											/>
											<FieldError errors={reasonField.state.meta.errors} />
										</Field>
									);
								}}
							</removeStoreImageReasonForm.Field>
							<Button
								type="submit"
								variant="destructive"
								disabled={removeStoreImageMutation.isPending}
							>
								{removeStoreImageMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_moderation_action_submitting()}
									</>
								) : (
									m.admin_moderation_action_remove_store_image_button()
								)}
							</Button>
							{removeStoreImageMutation.error ? (
								<p className="text-sm text-destructive">
									{removeStoreImageMutation.error.message}
								</p>
							) : null}
						</form>
					) : null}

					{isOpen && report.targetType === 'MALL_IMAGE' ? (
						<form onSubmit={handleRemoveMallImageSubmit} className="space-y-4">
							<div className="space-y-1">
								<h3 className="text-sm font-medium text-foreground">
									{m.admin_moderation_action_mall_image_removed()}
								</h3>
								<p className="text-sm text-muted-foreground">
									{m.admin_moderation_detail_remove_mall_image_description()}
								</p>
							</div>
							<removeMallImageReasonForm.Field name="reason">
								{(reasonField) => {
									const isInvalid =
										reasonField.state.meta.isTouched &&
										!reasonField.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="remove-mall-image-reason">
												{m.admin_moderation_reason_label()}
											</FieldLabel>
											<Input
												id="remove-mall-image-reason"
												value={reasonField.state.value}
												onChange={(event) =>
													reasonField.handleChange(event.target.value)
												}
												onBlur={reasonField.handleBlur}
												placeholder={m.admin_moderation_reason_placeholder()}
												aria-invalid={isInvalid}
												disabled={removeMallImageMutation.isPending}
											/>
											<FieldError errors={reasonField.state.meta.errors} />
										</Field>
									);
								}}
							</removeMallImageReasonForm.Field>
							<Button
								type="submit"
								variant="destructive"
								disabled={removeMallImageMutation.isPending}
							>
								{removeMallImageMutation.isPending ? (
									<>
										<Spinner />
										{m.admin_moderation_action_submitting()}
									</>
								) : (
									m.admin_moderation_action_remove_mall_image_button()
								)}
							</Button>
							{removeMallImageMutation.error ? (
								<p className="text-sm text-destructive">
									{removeMallImageMutation.error.message}
								</p>
							) : null}
						</form>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
