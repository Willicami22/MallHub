import { ArrowLeft01Icon, Invoice03Icon } from '@hugeicons/core-free-icons';
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
	Textarea,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
	formatBillingDate,
	getBillingPaymentMethodLabel,
	getBillingPlanLabel,
	getBillingTargetTypeLabel,
} from '@/features/admin-platform/billing/components/billing-labels.lib';
import { BillingSubscriptionStatusBadge } from '@/features/admin-platform/billing/components/billing-subscription-status-badge';
import {
	REGISTER_BILLING_PAYMENT_FORM_OPTIONS,
	toRegisterBillingPaymentSubmitData,
	useRegisterBillingPaymentForm,
} from '@/features/admin-platform/billing/components/register-billing-payment.form';
import {
	SEND_COLLECTION_ALERT_FORM_OPTIONS,
	toSendCollectionAlertSubmitData,
	useSendCollectionAlertForm,
} from '@/features/admin-platform/billing/components/send-collection-alert.form';
import {
	getUpdateBillingPlanFormDefaultValues,
	toUpdateBillingPlanSubmitData,
	UPDATE_BILLING_PLAN_FORM_OPTIONS,
	useUpdateBillingPlanForm,
} from '@/features/admin-platform/billing/components/update-billing-plan.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-billing-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.admin_billing_detail_meta_title() },
	{ name: 'description', content: m.admin_billing_detail_meta_description() },
];

const PLAN_ITEMS = [
	{
		value: 'BASIC',
		label: () => m.admin_billing_plan_basic(),
	},
	{
		value: 'STANDARD',
		label: () => m.admin_billing_plan_standard(),
	},
	{
		value: 'PREMIUM',
		label: () => m.admin_billing_plan_premium(),
	},
] as const;

const STATUS_ITEMS = [
	{
		value: 'ACTIVE',
		label: () => m.admin_billing_status_active(),
	},
	{
		value: 'SUSPENDED',
		label: () => m.admin_billing_status_suspended(),
	},
] as const;

const PAYMENT_METHOD_ITEMS = [
	{
		value: 'BANK_TRANSFER',
		label: () => m.admin_billing_payment_method_bank_transfer(),
	},
	{
		value: 'CREDIT_CARD',
		label: () => m.admin_billing_payment_method_credit_card(),
	},
	{
		value: 'DEBIT_CARD',
		label: () => m.admin_billing_payment_method_debit_card(),
	},
	{
		value: 'CASH',
		label: () => m.admin_billing_payment_method_cash(),
	},
	{
		value: 'OTHER',
		label: () => m.admin_billing_payment_method_other(),
	},
] as const;

const BILLING_CURRENCY = 'USD';

const formatBillingMoney = (value: { toString(): string } | number): string =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: BILLING_CURRENCY,
	}).format(typeof value === 'number' ? value : Number(value.toString()));

const toDateInputValue = (value: string | Date | null): string =>
	value ? new Date(value).toISOString().slice(0, 10) : '';

export default function AdminBillingDetailRoute({
	params,
}: Route.ComponentProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const subscriptionId = params.subscriptionId;
	const [lastSyncedSubscriptionId, setLastSyncedSubscriptionId] = useState<
		string | null
	>(null);

	const subscriptionQuery = useQuery(
		trpc.adminBilling.get.queryOptions({
			subscriptionId,
		}),
	);

	const invalidateBilling = async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.adminBilling.pathKey(),
		});
	};

	const setMallPlanMutation = useMutation(
		trpc.adminBilling.setMallPlan.mutationOptions({
			onSuccess: invalidateBilling,
		}),
	);
	const setStorePlanMutation = useMutation(
		trpc.adminBilling.setStorePlan.mutationOptions({
			onSuccess: invalidateBilling,
		}),
	);
	const registerPaymentMutation = useMutation(
		trpc.adminBilling.registerPayment.mutationOptions({
			onSuccess: invalidateBilling,
		}),
	);
	const sendCollectionAlertMutation = useMutation(
		trpc.adminBilling.sendCollectionAlert.mutationOptions({
			onSuccess: invalidateBilling,
		}),
	);

	const updatePlanForm = useUpdateBillingPlanForm({
		...UPDATE_BILLING_PLAN_FORM_OPTIONS,
		onSubmit: async ({ value }) => {
			const subscription = subscriptionQuery.data?.subscription;
			if (!subscription) {
				return;
			}

			const submitData = toUpdateBillingPlanSubmitData(value);
			if (!submitData) {
				return;
			}

			if (subscription.targetType === 'MALL' && subscription.mall) {
				await setMallPlanMutation.mutateAsync({
					mallId: subscription.mall.id,
					planCode: submitData.planCode,
					status: submitData.status,
					recurringAmount: submitData.recurringAmount,
					currentPeriodStart: submitData.currentPeriodStart,
					nextPaymentDueAt: submitData.nextPaymentDueAt ?? undefined,
					reason: submitData.reason ?? undefined,
				});
				return;
			}

			if (subscription.targetType === 'STORE' && subscription.store) {
				await setStorePlanMutation.mutateAsync({
					storeId: subscription.store.id,
					planCode: submitData.planCode,
					status: submitData.status,
					recurringAmount: submitData.recurringAmount,
					currentPeriodStart: submitData.currentPeriodStart,
					nextPaymentDueAt: submitData.nextPaymentDueAt ?? undefined,
					reason: submitData.reason ?? undefined,
				});
			}
		},
	});

	const registerPaymentForm = useRegisterBillingPaymentForm({
		...REGISTER_BILLING_PAYMENT_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const subscription = subscriptionQuery.data?.subscription;
			if (!subscription) {
				return;
			}

			const submitData = toRegisterBillingPaymentSubmitData(value);
			if (!submitData) {
				return;
			}

			await registerPaymentMutation.mutateAsync({
				subscriptionId: subscription.id,
				amount: Number(submitData.amount),
				paymentMethod: submitData.paymentMethod,
				paidAt: submitData.paidAt ?? undefined,
				reference: submitData.reference ?? undefined,
				notes: submitData.notes ?? undefined,
			});
			formApi.reset();
		},
	});

	const sendCollectionAlertForm = useSendCollectionAlertForm({
		...SEND_COLLECTION_ALERT_FORM_OPTIONS,
		onSubmit: async ({ value, formApi }) => {
			const subscription = subscriptionQuery.data?.subscription;
			if (!subscription) {
				return;
			}

			const submitData = toSendCollectionAlertSubmitData(value);
			if (!submitData) {
				return;
			}

			await sendCollectionAlertMutation.mutateAsync({
				subscriptionId: subscription.id,
				reason: submitData.reason ?? undefined,
			});
			formApi.reset();
		},
	});

	useEffect(() => {
		const subscription = subscriptionQuery.data?.subscription;
		if (!subscription || lastSyncedSubscriptionId === subscription.id) {
			return;
		}

		updatePlanForm.reset(
			getUpdateBillingPlanFormDefaultValues({
				planCode: subscription.planCode,
				status: subscription.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
				recurringAmount: Number(subscription.recurringAmount.toString()),
				currentPeriodStart: toDateInputValue(subscription.currentPeriodStart),
				nextPaymentDueAt: toDateInputValue(subscription.nextPaymentDueAt),
				reason: null,
			}),
		);
		setLastSyncedSubscriptionId(subscription.id);
	}, [
		lastSyncedSubscriptionId,
		subscriptionQuery.data?.subscription,
		updatePlanForm,
	]);

	const handleUpdatePlanSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void updatePlanForm.handleSubmit();
	};

	const handleRegisterPaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void registerPaymentForm.handleSubmit();
	};

	const handleCollectionAlertSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void sendCollectionAlertForm.handleSubmit();
	};

	if (subscriptionQuery.isLoading) {
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

	const subscription = subscriptionQuery.data?.subscription;
	if (!subscription) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
				<Card>
					<CardHeader>
						<CardTitle>{m.admin_billing_detail_not_found_title()}</CardTitle>
						<CardDescription>
							{m.admin_billing_detail_not_found_description()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							nativeButton={false}
							render={<Link to={localizeHref('/admin/billing')} />}
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
							{m.admin_billing_detail_back_to_list()}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const entityName =
		subscription.targetType === 'MALL'
			? subscription.mall?.name
			: subscription.store?.name;

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4">
				<Button
					variant="outline"
					size="sm"
					className="w-fit"
					nativeButton={false}
					render={<Link to={localizeHref('/admin/billing')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.admin_billing_detail_back_to_list()}
				</Button>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={Invoice03Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{entityName ?? m.admin_billing_date_not_available()}
						</h1>
						<p className="text-sm text-muted-foreground">
							{getBillingTargetTypeLabel(subscription.targetType)}
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_380px]">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_billing_detail_summary_title()}</CardTitle>
							<CardDescription>
								{m.admin_billing_detail_summary_description()}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_detail_summary_entity()}
								</span>
								<span className="font-medium">
									{entityName ?? m.admin_billing_date_not_available()}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_detail_summary_target()}
								</span>
								<span className="font-medium">
									{getBillingTargetTypeLabel(subscription.targetType)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_column_plan()}
								</span>
								<span className="font-medium">
									{getBillingPlanLabel(subscription.planCode)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_column_status()}
								</span>
								<BillingSubscriptionStatusBadge
									status={subscription.effectiveStatus}
								/>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_column_recurring_amount()}
								</span>
								<span className="font-medium">
									{formatBillingMoney(subscription.recurringAmount)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_detail_summary_current_period()}
								</span>
								<span className="font-medium">
									{m.admin_billing_detail_current_period_value({
										start: formatBillingDate(subscription.currentPeriodStart),
										end: formatBillingDate(subscription.currentPeriodEnd),
									})}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_detail_summary_next_due()}
								</span>
								<span className="font-medium">
									{formatBillingDate(subscription.nextPaymentDueAt)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_column_overdue_amount()}
								</span>
								<span className="font-medium">
									{formatBillingMoney(subscription.overdueAmount ?? 0)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">
									{m.admin_billing_detail_summary_last_payment()}
								</span>
								<span className="font-medium">
									{formatBillingDate(subscription.lastPaymentAt)}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_billing_detail_recent_payments_title()}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{subscription.payments.length ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												{m.admin_billing_detail_recent_payments_column_amount()}
											</TableHead>
											<TableHead>
												{m.admin_billing_detail_recent_payments_column_paid_at()}
											</TableHead>
											<TableHead>
												{m.admin_billing_detail_recent_payments_column_method()}
											</TableHead>
											<TableHead>
												{m.admin_billing_detail_recent_payments_column_reference()}
											</TableHead>
											<TableHead>
												{m.admin_billing_detail_recent_payments_column_registered_by()}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{subscription.payments.map((payment) => (
											<TableRow key={payment.id}>
												<TableCell className="font-medium">
													{payment.amount.toString()} {payment.currency}
												</TableCell>
												<TableCell>
													{formatBillingDate(payment.paidAt)}
												</TableCell>
												<TableCell>
													{getBillingPaymentMethodLabel(payment.paymentMethod)}
												</TableCell>
												<TableCell>
													{payment.reference ??
														m.admin_billing_date_not_available()}
												</TableCell>
												<TableCell>{payment.registeredByUser.name}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-sm text-muted-foreground">
									{m.admin_billing_detail_recent_payments_empty()}
								</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_billing_detail_recent_alerts_title()}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{subscription.collectionAlerts.length ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												{m.admin_billing_detail_recent_alerts_column_sent_at()}
											</TableHead>
											<TableHead>
												{m.admin_billing_detail_recent_alerts_column_reason()}
											</TableHead>
											<TableHead>
												{m.admin_billing_detail_recent_alerts_column_sent_by()}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{subscription.collectionAlerts.map((alert) => (
											<TableRow key={alert.id}>
												<TableCell>{formatBillingDate(alert.sentAt)}</TableCell>
												<TableCell>
													{alert.reason ?? m.admin_billing_date_not_available()}
												</TableCell>
												<TableCell>{alert.createdByUser.name}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-sm text-muted-foreground">
									{m.admin_billing_detail_recent_alerts_empty()}
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_billing_detail_change_plan_title()}
							</CardTitle>
							<CardDescription>
								{m.admin_billing_detail_change_plan_description()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleUpdatePlanSubmit} className="space-y-4">
								<updatePlanForm.Field name="planCode">
									{(field) => (
										<Field>
											<FieldLabel>
												{m.admin_billing_detail_plan_label()}
											</FieldLabel>
											<Select
												items={PLAN_ITEMS.map((item) => ({
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
												disabled={
													setMallPlanMutation.isPending ||
													setStorePlanMutation.isPending
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{PLAN_ITEMS.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</updatePlanForm.Field>

								<updatePlanForm.Field name="status">
									{(field) => (
										<Field>
											<FieldLabel>
												{m.admin_billing_detail_status_label()}
											</FieldLabel>
											<Select
												items={STATUS_ITEMS.map((item) => ({
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
												disabled={
													setMallPlanMutation.isPending ||
													setStorePlanMutation.isPending
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{STATUS_ITEMS.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</updatePlanForm.Field>

								<updatePlanForm.Field name="currentPeriodStart">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="billing-current-period-start">
													{m.admin_billing_detail_period_start_label()}
												</FieldLabel>
												<Input
													id="billing-current-period-start"
													type="date"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
													disabled={
														setMallPlanMutation.isPending ||
														setStorePlanMutation.isPending
													}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updatePlanForm.Field>

								<updatePlanForm.Field name="recurringAmount">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="billing-recurring-amount">
													{m.admin_billing_detail_recurring_amount_label()}
												</FieldLabel>
												<Input
													id="billing-recurring-amount"
													type="number"
													step="0.01"
													min="0.01"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
													disabled={
														setMallPlanMutation.isPending ||
														setStorePlanMutation.isPending
													}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</updatePlanForm.Field>

								<updatePlanForm.Field name="nextPaymentDueAt">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="billing-next-due">
												{m.admin_billing_detail_next_due_label()}
											</FieldLabel>
											<Input
												id="billing-next-due"
												type="date"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												disabled={
													setMallPlanMutation.isPending ||
													setStorePlanMutation.isPending
												}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</updatePlanForm.Field>

								<updatePlanForm.Field name="reason">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="billing-change-reason">
												{m.admin_billing_detail_reason_label()}
											</FieldLabel>
											<Textarea
												id="billing-change-reason"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_billing_detail_reason_placeholder()}
												disabled={
													setMallPlanMutation.isPending ||
													setStorePlanMutation.isPending
												}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</updatePlanForm.Field>

								{setMallPlanMutation.error || setStorePlanMutation.error ? (
									<p className="text-sm text-destructive">
										{setMallPlanMutation.error?.message ??
											setStorePlanMutation.error?.message}
									</p>
								) : null}

								<Button
									type="submit"
									className="w-full"
									disabled={
										setMallPlanMutation.isPending ||
										setStorePlanMutation.isPending
									}
								>
									{setMallPlanMutation.isPending ||
									setStorePlanMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_billing_detail_change_plan_submitting()}
										</>
									) : (
										m.admin_billing_detail_change_plan_submit()
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_billing_detail_register_payment_title()}
							</CardTitle>
							<CardDescription>
								{m.admin_billing_detail_register_payment_description()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleRegisterPaymentSubmit}
								className="space-y-4"
							>
								<registerPaymentForm.Field name="amount">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="billing-payment-amount">
													{m.admin_billing_detail_payment_amount_label()}
												</FieldLabel>
												<Input
													id="billing-payment-amount"
													type="number"
													step="0.01"
													min="0.01"
													value={field.state.value}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													onBlur={field.handleBlur}
													placeholder={m.admin_billing_detail_payment_amount_placeholder()}
													aria-invalid={isInvalid}
													disabled={registerPaymentMutation.isPending}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										);
									}}
								</registerPaymentForm.Field>

								<registerPaymentForm.Field name="paymentMethod">
									{(field) => (
										<Field>
											<FieldLabel>
												{m.admin_billing_detail_payment_method_label()}
											</FieldLabel>
											<Select
												items={PAYMENT_METHOD_ITEMS.map((item) => ({
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
												disabled={registerPaymentMutation.isPending}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{PAYMENT_METHOD_ITEMS.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</registerPaymentForm.Field>

								<registerPaymentForm.Field name="paidAt">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="billing-payment-date">
												{m.admin_billing_detail_payment_date_label()}
											</FieldLabel>
											<Input
												id="billing-payment-date"
												type="date"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												disabled={registerPaymentMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</registerPaymentForm.Field>

								<registerPaymentForm.Field name="reference">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="billing-payment-reference">
												{m.admin_billing_detail_payment_reference_label()}
											</FieldLabel>
											<Input
												id="billing-payment-reference"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_billing_detail_payment_reference_placeholder()}
												disabled={registerPaymentMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</registerPaymentForm.Field>

								<registerPaymentForm.Field name="notes">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="billing-payment-notes">
												{m.admin_billing_detail_payment_notes_label()}
											</FieldLabel>
											<Textarea
												id="billing-payment-notes"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_billing_detail_payment_notes_placeholder()}
												disabled={registerPaymentMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</registerPaymentForm.Field>

								{registerPaymentMutation.error ? (
									<p className="text-sm text-destructive">
										{registerPaymentMutation.error.message}
									</p>
								) : null}

								<Button
									type="submit"
									className="w-full"
									disabled={registerPaymentMutation.isPending}
								>
									{registerPaymentMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_billing_detail_register_payment_submitting()}
										</>
									) : (
										m.admin_billing_detail_register_payment_submit()
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_billing_detail_collection_alert_title()}
							</CardTitle>
							<CardDescription>
								{m.admin_billing_detail_collection_alert_description()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleCollectionAlertSubmit}
								className="space-y-4"
							>
								<sendCollectionAlertForm.Field name="reason">
									{(field) => (
										<Field>
											<FieldLabel htmlFor="billing-alert-reason">
												{m.admin_billing_detail_collection_alert_reason_label()}
											</FieldLabel>
											<Textarea
												id="billing-alert-reason"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												onBlur={field.handleBlur}
												placeholder={m.admin_billing_detail_collection_alert_reason_placeholder()}
												disabled={sendCollectionAlertMutation.isPending}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</sendCollectionAlertForm.Field>

								{sendCollectionAlertMutation.error ? (
									<p className="text-sm text-destructive">
										{sendCollectionAlertMutation.error.message}
									</p>
								) : null}

								<Button
									type="submit"
									className="w-full"
									variant="destructive"
									disabled={sendCollectionAlertMutation.isPending}
								>
									{sendCollectionAlertMutation.isPending ? (
										<>
											<Spinner />
											{m.admin_billing_detail_collection_alert_submitting()}
										</>
									) : (
										m.admin_billing_detail_collection_alert_submit()
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
