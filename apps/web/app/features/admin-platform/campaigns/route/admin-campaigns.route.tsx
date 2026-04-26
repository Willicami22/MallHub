import {
	Chart01Icon,
	FilterIcon,
	Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
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
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
	formatCampaignCtr,
	formatCampaignDate,
} from '@/features/admin-platform/campaigns/components/campaign-labels.lib';
import { CampaignStatusBadge } from '@/features/admin-platform/campaigns/components/campaign-status-badge';
import {
	CAMPAIGN_UPSERT_FORM_OPTIONS,
	toCampaignUpsertSubmitData,
	useCampaignUpsertForm,
} from '@/features/admin-platform/campaigns/components/campaign-upsert.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-campaigns.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_campaigns_meta_title() },
	{ name: 'description', content: m.admin_campaigns_meta_description() },
];

const PAGE_SIZES = [10, 20, 50] as const;

const STATUS_FILTER_OPTIONS = [
	{
		value: 'ALL',
		label: () => m.admin_campaigns_filter_status_all(),
	},
	{
		value: 'DRAFT',
		label: () => m.admin_campaigns_status_draft(),
	},
	{
		value: 'ACTIVE',
		label: () => m.admin_campaigns_status_active(),
	},
	{
		value: 'PAUSED',
		label: () => m.admin_campaigns_status_paused(),
	},
	{
		value: 'EXPIRED',
		label: () => m.admin_campaigns_status_expired(),
	},
] as const;

const SORT_OPTIONS = [
	{
		value: 'updatedAt_desc',
		label: () => m.admin_campaigns_sort_updated_desc(),
	},
	{
		value: 'updatedAt_asc',
		label: () => m.admin_campaigns_sort_updated_asc(),
	},
	{
		value: 'startsAt_desc',
		label: () => m.admin_campaigns_sort_starts_desc(),
	},
	{
		value: 'startsAt_asc',
		label: () => m.admin_campaigns_sort_starts_asc(),
	},
	{
		value: 'endsAt_desc',
		label: () => m.admin_campaigns_sort_ends_desc(),
	},
	{
		value: 'endsAt_asc',
		label: () => m.admin_campaigns_sort_ends_asc(),
	},
] as const;

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

export default function AdminCampaignsRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('ALL');
	const [mallFilter, setMallFilter] = useState<string>('ALL');
	const [mallFilterSearch, setMallFilterSearch] = useState('');
	const [targetMallSearch, setTargetMallSearch] = useState('');
	const [sortValue, setSortValue] = useState<string>('updatedAt_desc');
	const [searchTimer, setSearchTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (searchTimer) {
			clearTimeout(searchTimer);
		}

		const timer = setTimeout(() => {
			setDebouncedSearch(value);
			setPage(1);
		}, 400);

		setSearchTimer(timer);
	};

	const [sortBy, sortDirection] = sortValue.split('_') as [
		'name' | 'createdAt' | 'updatedAt' | 'startsAt' | 'endsAt',
		'asc' | 'desc',
	];

	const mallFilterMallsQuery = useQuery(
		trpc.adminMalls.list.queryOptions({
			page: 1,
			pageSize: 20,
			search: mallFilterSearch.trim().length
				? mallFilterSearch.trim()
				: undefined,
			sortBy: 'name',
			sortDirection: 'asc',
		}),
	);
	const targetMallsQuery = useQuery(
		trpc.adminMalls.list.queryOptions({
			page: 1,
			pageSize: 20,
			search: targetMallSearch.trim().length
				? targetMallSearch.trim()
				: undefined,
			sortBy: 'name',
			sortDirection: 'asc',
		}),
	);

	const campaignsQuery = useQuery(
		trpc.adminCampaigns.list.queryOptions({
			page,
			pageSize,
			search: debouncedSearch || undefined,
			statusFilter:
				statusFilter === 'ALL'
					? undefined
					: (statusFilter as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED'),
			mallId: mallFilter === 'ALL' ? undefined : mallFilter,
			sortBy,
			sortDirection,
		}),
	);

	const invalidateCampaigns = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminCampaigns.pathKey(),
		});
	}, [queryClient, trpc]);

	const createCampaignMutation = useMutation(
		trpc.adminCampaigns.create.mutationOptions({
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

	const createCampaignForm = useCampaignUpsertForm({
		...CAMPAIGN_UPSERT_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const submitData = toCampaignUpsertSubmitData(value);
			if (!submitData) {
				return;
			}

			await createCampaignMutation.mutateAsync({
				name: submitData.name,
				advertiserName: submitData.advertiserName,
				bannerType: submitData.bannerType,
				imageUrl: submitData.imageUrl,
				destinationUrl: submitData.destinationUrl,
				startsAt: submitData.startsAt,
				endsAt: submitData.endsAt,
				targetMallIds: submitData.targetMallIds,
				activateOnCreate: submitData.activateOnCreate,
			});
			formApi.reset();
			setPage(1);
		},
	});

	const handleCreateCampaignSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void createCampaignForm.handleSubmit();
	};

	const mallFilterItems = useMemo(
		() => [
			{
				value: 'ALL',
				label: m.admin_campaigns_filter_mall_all(),
			},
			...(mallFilterMallsQuery.data?.malls ?? []).map((mall) => ({
				value: mall.id,
				label: mall.name,
			})),
		],
		[mallFilterMallsQuery.data?.malls],
	);
	const statusFilterItems = useMemo(
		() =>
			STATUS_FILTER_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);
	const sortItems = useMemo(
		() =>
			SORT_OPTIONS.map((option) => ({
				value: option.value,
				label: option.label(),
			})),
		[],
	);
	const pageSizeItems = useMemo(
		() =>
			PAGE_SIZES.map((size) => ({
				value: size.toString(),
				label: `${size} ${m.admin_campaigns_rows_per_page()}`,
			})),
		[],
	);

	const campaigns = campaignsQuery.data?.campaigns ?? [];
	const autoExpiredCount = campaignsQuery.data?.autoExpiredCount ?? 0;
	const total = campaignsQuery.data?.total ?? 0;
	const totalPages = campaignsQuery.data?.totalPages ?? 1;
	const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
	const to = Math.min(page * pageSize, total);
	const availableMalls = targetMallsQuery.data?.malls ?? [];
	const actionsBusy =
		activateCampaignMutation.isPending ||
		pauseCampaignMutation.isPending ||
		expireCampaignMutation.isPending;

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
					<HugeiconsIcon icon={Chart01Icon} className="size-5 text-primary" />
				</div>
				<div className="flex flex-col gap-0.5">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.admin_campaigns_title()}
					</h1>
					<p className="text-sm text-muted-foreground">
						{m.admin_campaigns_subtitle()}
					</p>
				</div>
			</div>

			{autoExpiredCount > 0 ? (
				<Card className="mb-6">
					<CardContent className="pt-4 pb-4">
						<p className="text-sm text-muted-foreground">
							{m.admin_campaigns_auto_expired_notice({
								count: autoExpiredCount.toString(),
							})}
						</p>
					</CardContent>
				</Card>
			) : null}

			<Card className="mb-6">
				<CardContent className="pt-4">
					<form onSubmit={handleCreateCampaignSubmit} className="grid gap-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<createCampaignForm.Field name="name">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="campaign-create-name">
												{m.admin_campaigns_create_name_label()}
											</FieldLabel>
											<Input
												id="campaign-create-name"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_campaigns_create_name_placeholder()}
												aria-invalid={isInvalid}
												disabled={createCampaignMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							</createCampaignForm.Field>

							<createCampaignForm.Field name="advertiserName">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="campaign-create-advertiser">
												{m.admin_campaigns_create_advertiser_label()}
											</FieldLabel>
											<Input
												id="campaign-create-advertiser"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_campaigns_create_advertiser_placeholder()}
												aria-invalid={isInvalid}
												disabled={createCampaignMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							</createCampaignForm.Field>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							<createCampaignForm.Field name="bannerType">
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
											disabled={createCampaignMutation.isPending}
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
							</createCampaignForm.Field>

							<createCampaignForm.Field name="startsAt">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="campaign-create-starts-at">
												{m.admin_campaigns_create_starts_at_label()}
											</FieldLabel>
											<Input
												id="campaign-create-starts-at"
												type="date"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												aria-invalid={isInvalid}
												disabled={createCampaignMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							</createCampaignForm.Field>

							<createCampaignForm.Field name="endsAt">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="campaign-create-ends-at">
												{m.admin_campaigns_create_ends_at_label()}
											</FieldLabel>
											<Input
												id="campaign-create-ends-at"
												type="date"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												aria-invalid={isInvalid}
												disabled={createCampaignMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							</createCampaignForm.Field>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<createCampaignForm.Field name="imageUrl">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="campaign-create-image-url">
												{m.admin_campaigns_create_image_url_label()}
											</FieldLabel>
											<Input
												id="campaign-create-image-url"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_campaigns_create_image_url_placeholder()}
												aria-invalid={isInvalid}
												disabled={createCampaignMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							</createCampaignForm.Field>

							<createCampaignForm.Field name="destinationUrl">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="campaign-create-destination-url">
												{m.admin_campaigns_create_destination_url_label()}
											</FieldLabel>
											<Input
												id="campaign-create-destination-url"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_campaigns_create_destination_url_placeholder()}
												aria-invalid={isInvalid}
												disabled={createCampaignMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							</createCampaignForm.Field>
						</div>

						<createCampaignForm.Field name="targetMallIds">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								const selectedMallIds = field.state.value;

								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>
											{m.admin_campaigns_create_target_malls_label()}
										</FieldLabel>
										<Input
											value={targetMallSearch}
											onChange={(event) =>
												setTargetMallSearch(event.target.value)
											}
											placeholder={m.admin_campaigns_target_mall_search_placeholder()}
											className="mb-2 max-w-sm"
										/>
										<div className="flex flex-wrap gap-2">
											{availableMalls.map((mall) => {
												const isSelected = selectedMallIds.includes(mall.id);
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

															field.handleChange([...selectedMallIds, mall.id]);
														}}
														disabled={createCampaignMutation.isPending}
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
						</createCampaignForm.Field>

						<createCampaignForm.Field name="activateOnCreate">
							{(field) => (
								<Field>
									<FieldLabel>
										{m.admin_campaigns_create_initial_status_label()}
									</FieldLabel>
									<Select
										items={[
											{
												value: 'false',
												label: m.admin_campaigns_create_initial_status_draft(),
											},
											{
												value: 'true',
												label: m.admin_campaigns_create_initial_status_active(),
											},
										]}
										value={field.state.value ? 'true' : 'false'}
										onValueChange={(value) => {
											field.handleChange(value === 'true');
										}}
										disabled={createCampaignMutation.isPending}
									>
										<SelectTrigger className="max-w-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="false">
												{m.admin_campaigns_create_initial_status_draft()}
											</SelectItem>
											<SelectItem value="true">
												{m.admin_campaigns_create_initial_status_active()}
											</SelectItem>
										</SelectContent>
									</Select>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						</createCampaignForm.Field>

						{createCampaignMutation.error ? (
							<p className="text-sm text-destructive">
								{createCampaignMutation.error.message}
							</p>
						) : null}

						<Button
							type="submit"
							className="w-fit"
							disabled={createCampaignMutation.isPending}
						>
							{createCampaignMutation.isPending ? (
								<>
									<Spinner />
									{m.admin_campaigns_create_submitting()}
								</>
							) : (
								m.admin_campaigns_create_submit()
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardContent className="pt-4 pb-4">
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<div className="relative flex-1">
								<HugeiconsIcon
									icon={Search01Icon}
									className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									value={search}
									onChange={(event) => handleSearchChange(event.target.value)}
									placeholder={m.admin_campaigns_search_placeholder()}
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2">
								<HugeiconsIcon
									icon={FilterIcon}
									className="size-4 text-muted-foreground"
								/>
								<Select
									items={mallFilterItems}
									value={mallFilter}
									onValueChange={(value) => {
										setMallFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[220px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{mallFilterItems.map((item) => (
											<SelectItem key={item.value} value={item.value}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									value={mallFilterSearch}
									onChange={(event) => setMallFilterSearch(event.target.value)}
									placeholder={m.admin_campaigns_filter_mall_search_placeholder()}
									className="w-[220px]"
								/>
								<Select
									items={statusFilterItems}
									value={statusFilter}
									onValueChange={(value) => {
										setStatusFilter(value ?? 'ALL');
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{STATUS_FILTER_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									items={sortItems}
									value={sortValue}
									onValueChange={(value) => {
										if (value === null) {
											return;
										}

										setSortValue(value);
										setPage(1);
									}}
								>
									<SelectTrigger className="w-[220px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SORT_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						{total > 0 ? (
							<div className="flex justify-end">
								<Badge variant="secondary">
									{m.admin_campaigns_total_count({ count: total })}
								</Badge>
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.admin_campaigns_column_name()}</TableHead>
							<TableHead>{m.admin_campaigns_column_advertiser()}</TableHead>
							<TableHead>{m.admin_campaigns_column_status()}</TableHead>
							<TableHead>{m.admin_campaigns_column_schedule()}</TableHead>
							<TableHead>{m.admin_campaigns_column_target_malls()}</TableHead>
							<TableHead>{m.admin_campaigns_column_impressions()}</TableHead>
							<TableHead>{m.admin_campaigns_column_clicks()}</TableHead>
							<TableHead>{m.admin_campaigns_column_ctr()}</TableHead>
							<TableHead>{m.admin_campaigns_column_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{campaignsQuery.isLoading ? (
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow key={`campaign-skeleton-${index.toString()}`}>
									<TableCell colSpan={9}>
										<div className="h-4 w-56 animate-pulse rounded bg-muted" />
									</TableCell>
								</TableRow>
							))
						) : campaigns.length > 0 ? (
							campaigns.map((campaign) => (
								<TableRow key={campaign.id}>
									<TableCell className="font-medium">{campaign.name}</TableCell>
									<TableCell>{campaign.advertiserName}</TableCell>
									<TableCell>
										<CampaignStatusBadge status={campaign.status} />
									</TableCell>
									<TableCell className="text-xs">
										<div>{formatCampaignDate(campaign.startsAt)}</div>
										<div className="text-muted-foreground">
											{formatCampaignDate(campaign.endsAt)}
										</div>
									</TableCell>
									<TableCell className="max-w-[220px]">
										{campaign.targetMalls.length
											? campaign.targetMalls.map((mall) => mall.name).join(', ')
											: m.admin_campaigns_date_not_available()}
									</TableCell>
									<TableCell>{campaign.impressions.toString()}</TableCell>
									<TableCell>{campaign.clicks.toString()}</TableCell>
									<TableCell>{formatCampaignCtr(campaign.ctr)}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-2">
											<Button
												size="sm"
												variant="outline"
												nativeButton={false}
												render={
													<Link
														to={localizeHref(`/admin/campaigns/${campaign.id}`)}
													/>
												}
											>
												{m.admin_campaigns_action_view_detail()}
											</Button>
											{campaign.status !== 'ACTIVE' &&
											campaign.status !== 'EXPIRED' ? (
												<Button
													size="sm"
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
											{campaign.status === 'ACTIVE' ? (
												<Button
													size="sm"
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
											{campaign.status !== 'EXPIRED' ? (
												<Button
													size="sm"
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
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={9}
									className="h-24 text-center text-muted-foreground"
								>
									{m.admin_campaigns_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					{total > 0
						? m.admin_campaigns_pagination_info({
								from: from.toString(),
								to: to.toString(),
								total: total.toString(),
							})
						: null}
				</p>
				<div className="flex items-center gap-2">
					<Select
						items={pageSizeItems}
						value={pageSize.toString()}
						onValueChange={(value) => {
							if (value === null) {
								return;
							}

							setPageSize(Number(value));
							setPage(1);
						}}
					>
						<SelectTrigger size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZES.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size} {m.admin_campaigns_rows_per_page()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((currentPage) => Math.max(1, currentPage - 1))
						}
						disabled={page <= 1 || campaignsQuery.isFetching}
					>
						{m.admin_campaigns_pagination_previous()}
					</Button>
					<span className="text-sm text-muted-foreground tabular-nums">
						{page} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((currentPage) => Math.min(totalPages, currentPage + 1))
						}
						disabled={page >= totalPages || campaignsQuery.isFetching}
					>
						{m.admin_campaigns_pagination_next()}
					</Button>
				</div>
			</div>
		</div>
	);
}
