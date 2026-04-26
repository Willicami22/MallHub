import { ArrowLeft01Icon, Chart01Icon } from '@hugeicons/core-free-icons';
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
	CAMPAIGN_DAILY_METRIC_FORM_OPTIONS,
	toCampaignDailyMetricSubmitData,
	useCampaignDailyMetricForm,
} from '@/features/admin-platform/campaigns/components/campaign-daily-metric.form';
import {
	formatCampaignCtr,
	formatCampaignDate,
} from '@/features/admin-platform/campaigns/components/campaign-labels.lib';
import { CampaignStatusBadge } from '@/features/admin-platform/campaigns/components/campaign-status-badge';
import {
	CAMPAIGN_UPSERT_FORM_OPTIONS,
	getCampaignUpsertFormDefaultValues,
	toCampaignUpsertSubmitData,
	useCampaignUpsertForm,
} from '@/features/admin-platform/campaigns/components/campaign-upsert.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-campaign-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_campaigns_detail_meta_title() },
	{ name: 'description', content: m.admin_campaigns_detail_meta_description() },
];

const BANNER_TYPE_ITEMS = [
	{
		value: 'IMAGE',
		label: () => m.admin_campaigns_banner_type_image(),
	},
	{
		value: 'NATIVE_CARD',
		label: () => m.admin_campaigns_banner_type_native_card(),
	},
] as const;

const toDateInputValue = (value: string | Date | null): string =>
	value ? new Date(value).toISOString().slice(0, 10) : '';

const escapeCsvCell = (value: string): string => {
	const escapedValue = value.replace(/"/g, '""');
	return `"${escapedValue}"`;
};

type CampaignPerformanceReportRow = {
	date: Date;
	impressions: number;
	clicks: number;
	ctr: number;
};

type CampaignPerformanceReport = {
	campaignName: string;
	status: string;
	startsAt: Date;
	endsAt: Date;
	targetMalls: Array<{ name: string }>;
	totals: {
		impressions: number;
		clicks: number;
		ctr: number;
	};
	rows: CampaignPerformanceReportRow[];
	generatedAt: Date;
	fileName: string;
};

const buildCampaignPerformanceCsv = (
	report: CampaignPerformanceReport,
): string => {
	const lines = [
		`${escapeCsvCell('Campaign Name')},${escapeCsvCell(report.campaignName)}`,
		`${escapeCsvCell('Status')},${escapeCsvCell(report.status)}`,
		`${escapeCsvCell('Starts At')},${escapeCsvCell(new Date(report.startsAt).toISOString())}`,
		`${escapeCsvCell('Ends At')},${escapeCsvCell(new Date(report.endsAt).toISOString())}`,
		`${escapeCsvCell('Target Malls')},${escapeCsvCell(report.targetMalls.map((mall) => mall.name).join(' | '))}`,
		`${escapeCsvCell('Total Impressions')},${escapeCsvCell(report.totals.impressions.toString())}`,
		`${escapeCsvCell('Total Clicks')},${escapeCsvCell(report.totals.clicks.toString())}`,
		`${escapeCsvCell('Total CTR')},${escapeCsvCell(formatCampaignCtr(report.totals.ctr))}`,
		`${escapeCsvCell('Generated At')},${escapeCsvCell(new Date(report.generatedAt).toISOString())}`,
		'',
		[
			escapeCsvCell('Date'),
			escapeCsvCell('Impressions'),
			escapeCsvCell('Clicks'),
			escapeCsvCell('CTR'),
		].join(','),
		...report.rows.map((row) =>
			[
				escapeCsvCell(new Date(row.date).toISOString().slice(0, 10)),
				escapeCsvCell(row.impressions.toString()),
				escapeCsvCell(row.clicks.toString()),
				escapeCsvCell(formatCampaignCtr(row.ctr)),
			].join(','),
		),
	];

	return lines.join('\n');
};

export default function AdminCampaignDetailRoute({
	params,
}: Route.ComponentProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const campaignId = params.campaignId;
	const [lastSyncedCampaignId, setLastSyncedCampaignId] = useState<
		string | null
	>(null);

	const campaignQuery = useQuery(
		trpc.adminCampaigns.get.queryOptions({
			campaignId,
		}),
	);
	const mallsQuery = useQuery(
		trpc.adminMalls.list.queryOptions({
			page: 1,
			pageSize: 100,
			sortBy: 'name',
			sortDirection: 'asc',
		}),
	);

	const invalidateCampaigns = async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminCampaigns.pathKey(),
		});
	};

	const updateCampaignMutation = useMutation(
		trpc.adminCampaigns.update.mutationOptions({
			onSuccess: invalidateCampaigns,
		}),
	);
	const activateCampaignMutation = useMutation(
		trpc.adminCampaigns.activate.mutationOptions({
			onSuccess: invalidateCampaigns,
		}),
	);
	const pauseCampaignMutation = useMutation(
		trpc.adminCampaigns.pause.mutationOptions({
			onSuccess: invalidateCampaigns,
		}),
	);
	const expireCampaignMutation = useMutation(
		trpc.adminCampaigns.expire.mutationOptions({
			onSuccess: invalidateCampaigns,
		}),
	);
	const upsertDailyMetricMutation = useMutation(
		trpc.adminCampaigns.upsertDailyMetric.mutationOptions({
			onSuccess: invalidateCampaigns,
		}),
	);
	const exportReportMutation = useMutation({
		mutationFn: async () =>
			queryClient.fetchQuery(
				trpc.adminCampaigns.getPerformanceReport.queryOptions({
					campaignId,
				}),
			),
		onSuccess: ({ report }) => {
			const csv = buildCampaignPerformanceCsv(report);
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const downloadUrl = globalThis.URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = downloadUrl;
			anchor.download = report.fileName;
			document.body.append(anchor);
			anchor.click();
			anchor.remove();
			globalThis.URL.revokeObjectURL(downloadUrl);
		},
	});

	const updateCampaignForm = useCampaignUpsertForm({
		...CAMPAIGN_UPSERT_FORM_OPTIONS,
		onSubmit: async ({ value }) => {
			const campaign = campaignQuery.data?.campaign;
			if (!campaign) {
				return;
			}

			const submitData = toCampaignUpsertSubmitData(value);
			if (!submitData) {
				return;
			}

			await updateCampaignMutation.mutateAsync({
				campaignId: campaign.id,
				name: submitData.name,
				advertiserName: submitData.advertiserName,
				bannerType: submitData.bannerType,
				imageUrl: submitData.imageUrl,
				destinationUrl: submitData.destinationUrl,
				startsAt: submitData.startsAt,
				endsAt: submitData.endsAt,
				targetMallIds: submitData.targetMallIds,
			});
		},
	});
	const dailyMetricForm = useCampaignDailyMetricForm({
		...CAMPAIGN_DAILY_METRIC_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const campaign = campaignQuery.data?.campaign;
			if (!campaign) {
				return;
			}

			const submitData = toCampaignDailyMetricSubmitData(value);
			if (!submitData) {
				return;
			}

			await upsertDailyMetricMutation.mutateAsync({
				campaignId: campaign.id,
				metricDate: submitData.metricDate,
				impressions: Number(submitData.impressions),
				clicks: Number(submitData.clicks),
			});
			formApi.reset();
		},
	});

	useEffect(() => {
		const campaign = campaignQuery.data?.campaign;
		if (!campaign || lastSyncedCampaignId === campaign.id) {
			return;
		}

		updateCampaignForm.reset(
			getCampaignUpsertFormDefaultValues({
				name: campaign.name,
				advertiserName: campaign.advertiserName,
				bannerType: campaign.bannerType,
				imageUrl: campaign.imageUrl,
				destinationUrl: campaign.destinationUrl,
				startsAt: toDateInputValue(campaign.startsAt),
				endsAt: toDateInputValue(campaign.endsAt),
				targetMallIds: campaign.targetMalls.map((mall) => mall.id),
				activateOnCreate: false,
			}),
		);
		setLastSyncedCampaignId(campaign.id);
	}, [campaignQuery.data?.campaign, lastSyncedCampaignId, updateCampaignForm]);

	const handleUpdateCampaignSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void updateCampaignForm.handleSubmit();
	};

	const handleUpsertDailyMetricSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void dailyMetricForm.handleSubmit();
	};

	const campaign = campaignQuery.data?.campaign;
	const actionsBusy =
		activateCampaignMutation.isPending ||
		pauseCampaignMutation.isPending ||
		expireCampaignMutation.isPending;
	const availableMalls = mallsQuery.data?.malls ?? [];
	const performanceRows = campaign?.performance.dailyMetrics ?? [];
	const performanceTotals = campaign?.performance ?? null;
	const updatePending = updateCampaignMutation.isPending;

	const actionErrorMessage =
		activateCampaignMutation.error?.message ??
		pauseCampaignMutation.error?.message ??
		expireCampaignMutation.error?.message ??
		exportReportMutation.error?.message ??
		null;

	const canActivate =
		campaign !== undefined &&
		campaign !== null &&
		campaign.status !== 'ACTIVE' &&
		campaign.status !== 'EXPIRED';
	const canPause =
		campaign !== undefined && campaign !== null && campaign.status === 'ACTIVE';
	const canExpire =
		campaign !== undefined &&
		campaign !== null &&
		campaign.status !== 'EXPIRED';

	const targetMallCount = useMemo(
		() => campaign?.targetMalls.length ?? 0,
		[campaign?.targetMalls.length],
	);

	if (campaignQuery.isLoading) {
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

	if (!campaign) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_campaigns_detail_not_found_title()}</CardTitle>
						<CardDescription>
							{m.admin_campaigns_detail_not_found_description()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/campaigns')} />}
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
							{m.admin_campaigns_detail_back_to_list()}
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
					render={<Link to={localizeHref('/admin/campaigns')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.admin_campaigns_detail_back_to_list()}
				</Button>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon icon={Chart01Icon} className="size-5 text-primary" />
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{campaign.name}
						</h1>
						<p className="text-sm text-muted-foreground">
							{campaign.advertiserName}
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_420px]">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_campaigns_detail_summary_title()}</CardTitle>
							<CardDescription>
								{m.admin_campaigns_detail_summary_description()}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_campaigns_column_status()}
								</span>
								<CampaignStatusBadge status={campaign.status} />
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_campaigns_column_schedule()}
								</span>
								<span className="font-medium">
									{m.admin_campaigns_detail_schedule_value({
										start: formatCampaignDate(campaign.startsAt),
										end: formatCampaignDate(campaign.endsAt),
									})}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_campaigns_column_target_malls()}
								</span>
								<span className="font-medium">
									{m.admin_campaigns_detail_target_malls_count({
										count: targetMallCount,
									})}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_campaigns_column_impressions()}
								</span>
								<span className="font-medium">
									{performanceTotals?.impressions.toString() ?? '0'}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_campaigns_column_clicks()}
								</span>
								<span className="font-medium">
									{performanceTotals?.clicks.toString() ?? '0'}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_campaigns_column_ctr()}
								</span>
								<span className="font-medium">
									{formatCampaignCtr(performanceTotals?.ctr ?? 0)}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_campaigns_detail_daily_metrics_title()}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{performanceRows.length ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												{m.admin_campaigns_column_metric_date()}
											</TableHead>
											<TableHead>
												{m.admin_campaigns_column_impressions()}
											</TableHead>
											<TableHead>{m.admin_campaigns_column_clicks()}</TableHead>
											<TableHead>{m.admin_campaigns_column_ctr()}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{performanceRows.map((metric) => (
											<TableRow key={metric.id}>
												<TableCell>
													{formatCampaignDate(metric.metricDate)}
												</TableCell>
												<TableCell>{metric.impressions.toString()}</TableCell>
												<TableCell>{metric.clicks.toString()}</TableCell>
												<TableCell>{formatCampaignCtr(metric.ctr)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-sm text-muted-foreground">
									{m.admin_campaigns_detail_daily_metrics_empty()}
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_campaigns_detail_actions_title()}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex flex-wrap gap-2">
								{canActivate ? (
									<Button
										variant="secondary"
										onClick={() =>
											void activateCampaignMutation.mutateAsync({
												campaignId: campaign.id,
											})
										}
										disabled={actionsBusy}
									>
										{m.admin_campaigns_action_activate()}
									</Button>
								) : null}
								{canPause ? (
									<Button
										variant="outline"
										onClick={() =>
											void pauseCampaignMutation.mutateAsync({
												campaignId: campaign.id,
											})
										}
										disabled={actionsBusy}
									>
										{m.admin_campaigns_action_pause()}
									</Button>
								) : null}
								{canExpire ? (
									<Button
										variant="destructive"
										onClick={() =>
											void expireCampaignMutation.mutateAsync({
												campaignId: campaign.id,
											})
										}
										disabled={actionsBusy}
									>
										{m.admin_campaigns_action_expire()}
									</Button>
								) : null}
								<Button
									variant="outline"
									onClick={() => void exportReportMutation.mutateAsync()}
									disabled={exportReportMutation.isPending}
								>
									{exportReportMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_campaigns_detail_exporting()}
										</>
									) : (
										m.admin_campaigns_detail_export_report()
									)}
								</Button>
							</div>
							{actionErrorMessage ? (
								<p className="text-sm text-destructive">{actionErrorMessage}</p>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{m.admin_campaigns_detail_edit_title()}</CardTitle>
							<CardDescription>
								{m.admin_campaigns_detail_edit_description()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleUpdateCampaignSubmit} className="space-y-4">
								<updateCampaignForm.Field name="name">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="campaign-edit-name">
													{m.admin_campaigns_create_name_label()}
												</FieldLabel>
												<Input
													id="campaign-edit-name"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
													disabled={updatePending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updateCampaignForm.Field>

								<updateCampaignForm.Field name="advertiserName">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="campaign-edit-advertiser">
													{m.admin_campaigns_create_advertiser_label()}
												</FieldLabel>
												<Input
													id="campaign-edit-advertiser"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
													disabled={updatePending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updateCampaignForm.Field>

								<updateCampaignForm.Field name="bannerType">
									{(field) => (
										<Field>
											<FieldLabel>
												{m.admin_campaigns_create_banner_type_label()}
											</FieldLabel>
											<Select
												items={BANNER_TYPE_ITEMS.map((item) => ({
													value: item.value,
													label: item.label(),
												}))}
												value={field.state.value}
												onValueChange={(value) => {
													if (!value) {
														return;
													}

													field.handleChange(value);
												}}
												disabled={updatePending}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{BANNER_TYPE_ITEMS.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</updateCampaignForm.Field>

								<updateCampaignForm.Field name="imageUrl">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="campaign-edit-image-url">
													{m.admin_campaigns_create_image_url_label()}
												</FieldLabel>
												<Input
													id="campaign-edit-image-url"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
													disabled={updatePending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updateCampaignForm.Field>

								<updateCampaignForm.Field name="destinationUrl">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="campaign-edit-destination-url">
													{m.admin_campaigns_create_destination_url_label()}
												</FieldLabel>
												<Input
													id="campaign-edit-destination-url"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
													disabled={updatePending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updateCampaignForm.Field>

								<div className="grid gap-4 sm:grid-cols-2">
									<updateCampaignForm.Field name="startsAt">
										{(field) => (
											<Field>
												<FieldLabel htmlFor="campaign-edit-starts-at">
													{m.admin_campaigns_create_starts_at_label()}
												</FieldLabel>
												<Input
													id="campaign-edit-starts-at"
													type="date"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													disabled={updatePending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										)}
									</updateCampaignForm.Field>

									<updateCampaignForm.Field name="endsAt">
										{(field) => (
											<Field>
												<FieldLabel htmlFor="campaign-edit-ends-at">
													{m.admin_campaigns_create_ends_at_label()}
												</FieldLabel>
												<Input
													id="campaign-edit-ends-at"
													type="date"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													disabled={updatePending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										)}
									</updateCampaignForm.Field>
								</div>

								<updateCampaignForm.Field name="targetMallIds">
									{(field) => {
										const selectedMallIds = field.state.value;
										return (
											<Field>
												<FieldLabel>
													{m.admin_campaigns_create_target_malls_label()}
												</FieldLabel>
												<div className="flex flex-wrap gap-2">
													{availableMalls.map((mall) => {
														const isSelected = selectedMallIds.includes(
															mall.id,
														);
														return (
															<Button
																key={mall.id}
																type="button"
																size="sm"
																variant={isSelected ? 'secondary' : 'outline'}
																onClick={() => {
																	if (isSelected) {
																		field.handleChange(
																			selectedMallIds.filter(
																				(selectedId) => selectedId !== mall.id,
																			),
																		);
																		return;
																	}

																	field.handleChange([
																		...selectedMallIds,
																		mall.id,
																	]);
																}}
																disabled={updatePending}
															>
																{mall.name}
															</Button>
														);
													})}
												</div>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updateCampaignForm.Field>

								{updateCampaignMutation.error ? (
									<p className="text-sm text-destructive">
										{updateCampaignMutation.error.message}
									</p>
								) : null}

								<Button
									type="submit"
									className="w-full"
									disabled={updatePending}
								>
									{updatePending ? (
										<>
											<Spinner />
											{m.admin_campaigns_detail_edit_submitting()}
										</>
									) : (
										m.admin_campaigns_detail_edit_submit()
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_campaigns_detail_upsert_metric_title()}
							</CardTitle>
							<CardDescription>
								{m.admin_campaigns_detail_upsert_metric_description()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleUpsertDailyMetricSubmit}
								className="space-y-4"
							>
								<dailyMetricForm.Field name="metricDate">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="campaign-metric-date">
												{m.admin_campaigns_column_metric_date()}
											</FieldLabel>
											<Input
												id="campaign-metric-date"
												type="date"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												disabled={upsertDailyMetricMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</dailyMetricForm.Field>

								<div className="grid gap-4 sm:grid-cols-2">
									<dailyMetricForm.Field name="impressions">
										{(field) => (
											<Field>
												<FieldLabel htmlFor="campaign-metric-impressions">
													{m.admin_campaigns_column_impressions()}
												</FieldLabel>
												<Input
													id="campaign-metric-impressions"
													type="number"
													min="0"
													step="1"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													disabled={upsertDailyMetricMutation.isPending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										)}
									</dailyMetricForm.Field>

									<dailyMetricForm.Field name="clicks">
										{(field) => (
											<Field>
												<FieldLabel htmlFor="campaign-metric-clicks">
													{m.admin_campaigns_column_clicks()}
												</FieldLabel>
												<Input
													id="campaign-metric-clicks"
													type="number"
													min="0"
													step="1"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													disabled={upsertDailyMetricMutation.isPending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										)}
									</dailyMetricForm.Field>
								</div>

								{upsertDailyMetricMutation.error ? (
									<p className="text-sm text-destructive">
										{upsertDailyMetricMutation.error.message}
									</p>
								) : null}

								<Button
									type="submit"
									className="w-full"
									disabled={upsertDailyMetricMutation.isPending}
								>
									{upsertDailyMetricMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_campaigns_detail_upsert_metric_submitting()}
										</>
									) : (
										m.admin_campaigns_detail_upsert_metric_submit()
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
