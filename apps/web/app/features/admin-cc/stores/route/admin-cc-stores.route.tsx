import {
	Alert02Icon,
	Cancel01Icon,
	CheckmarkBadge01Icon,
	LinkSquare01Icon,
	MoreHorizontalIcon,
	Time01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Field,
	FieldError,
	FieldLabel,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import {
	REJECT_STORE_REGISTRATION_FORM_OPTIONS,
	useRejectStoreRegistrationForm,
} from '@/features/admin-cc/stores/reject-store-registration.form';
import {
	SUSPEND_STORE_FORM_OPTIONS,
	useSuspendStoreForm,
} from '@/features/admin-cc/stores/suspend-store.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/admin-cc-stores.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: `${m.admin_cc_stores_title()} | Admin CC` }];
}

type ApproveDialogState =
	| { open: true; registrationRequestId: string; storeName: string }
	| { open: false };
type RejectDialogState =
	| { open: true; registrationRequestId: string; storeName: string }
	| { open: false };
type SuspendDialogState =
	| {
			open: true;
			storeId: string;
			storeName: string;
			activeReservationsCount: number;
	  }
	| { open: false };
type ReactivateDialogState =
	| { open: true; storeId: string; storeName: string }
	| { open: false };

export default function AdminCcStoresRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [approveDialog, setApproveDialog] = useState<ApproveDialogState>({
		open: false,
	});
	const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
		open: false,
	});
	const [suspendDialog, setSuspendDialog] = useState<SuspendDialogState>({
		open: false,
	});
	const [reactivateDialog, setReactivateDialog] =
		useState<ReactivateDialogState>({ open: false });

	const { data, isLoading } = useQuery({
		...trpc.adminCc.stores.getStores.queryOptions(),
		gcTime: 0,
	});

	const invalidateStores = () => {
		queryClient.invalidateQueries({
			queryKey: trpc.adminCc.stores.getStores.queryKey(),
		});
		queryClient.invalidateQueries({
			queryKey: trpc.adminCc.stores.getPendingCount.queryKey(),
		});
	};

	const approveMutation = useMutation(
		trpc.adminCc.stores.approveRegistration.mutationOptions({
			onSuccess: () => {
				toast.success(m.admin_cc_stores_toast_approved());
				setApproveDialog({ open: false });
				invalidateStores();
			},
			onError: () => {
				toast.error(m.admin_cc_stores_toast_error());
			},
		}),
	);

	const rejectMutation = useMutation(
		trpc.adminCc.stores.rejectRegistration.mutationOptions({
			onSuccess: () => {
				toast(m.admin_cc_stores_toast_rejected());
				setRejectDialog({ open: false });
				invalidateStores();
			},
			onError: () => {
				toast.error(m.admin_cc_stores_toast_error());
			},
		}),
	);

	const suspendMutation = useMutation(
		trpc.adminCc.stores.suspend.mutationOptions({
			onSuccess: () => {
				toast(m.admin_cc_stores_toast_suspended());
				setSuspendDialog({ open: false });
				invalidateStores();
			},
			onError: () => {
				toast.error(m.admin_cc_stores_toast_error());
			},
		}),
	);

	const reactivateMutation = useMutation(
		trpc.adminCc.stores.reactivate.mutationOptions({
			onSuccess: () => {
				toast.success(m.admin_cc_stores_toast_reactivated());
				setReactivateDialog({ open: false });
				invalidateStores();
			},
			onError: () => {
				toast.error(m.admin_cc_stores_toast_error());
			},
		}),
	);

	const rejectForm = useRejectStoreRegistrationForm({
		...REJECT_STORE_REGISTRATION_FORM_OPTIONS,
		onSubmit: ({ value }) => {
			if (!rejectDialog.open) return;
			rejectMutation.mutate({
				registrationRequestId: rejectDialog.registrationRequestId,
				reason: value.reason,
			});
		},
	});

	const suspendForm = useSuspendStoreForm({
		...SUSPEND_STORE_FORM_OPTIONS,
		onSubmit: ({ value }) => {
			if (!suspendDialog.open) return;
			suspendMutation.mutate({
				storeId: suspendDialog.storeId,
				reason: value.reason,
			});
		},
	});

	const handleRejectSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		void rejectForm.handleSubmit();
	};

	const handleSuspendSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		void suspendForm.handleSubmit();
	};

	const pendingCount = data?.pendingRegistrations.length ?? 0;
	const activeCount = data?.activeStores.length ?? 0;
	const suspendedCount = data?.suspendedStores.length ?? 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{m.admin_cc_stores_title()}
				</h1>
				<p className="text-muted-foreground">{m.admin_cc_stores_subtitle()}</p>
			</div>

			{pendingCount > 0 && (
				<Alert>
					<HugeiconsIcon icon={Alert02Icon} className="size-4" />
					<AlertTitle>{m.admin_cc_stores_pending_banner_title()}</AlertTitle>
					<AlertDescription>
						{m.admin_cc_stores_pending_banner_desc({ count: pendingCount })}
					</AlertDescription>
				</Alert>
			)}

			<Tabs defaultValue="pending">
				<TabsList>
					<TabsTrigger value="pending">
						{m.admin_cc_stores_tab_pending({ count: pendingCount })}
					</TabsTrigger>
					<TabsTrigger value="active">
						{m.admin_cc_stores_tab_active()}
						{activeCount > 0 && (
							<Badge variant="secondary" className="ml-1.5 text-xs">
								{activeCount}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="suspended">
						{m.admin_cc_stores_tab_suspended()}
						{suspendedCount > 0 && (
							<Badge variant="destructive" className="ml-1.5 text-xs">
								{suspendedCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				{/* ─── PENDIENTES ─── */}
				<TabsContent value="pending">
					<Card>
						<CardHeader>
							<CardTitle>
								{m.admin_cc_stores_tab_pending({ count: pendingCount })}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex justify-center py-8">
									<Spinner />
								</div>
							) : pendingCount === 0 ? (
								<p className="py-8 text-center text-muted-foreground">
									{m.admin_cc_stores_pending_empty()}
								</p>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{m.admin_cc_stores_col_name()}</TableHead>
												<TableHead>
													{m.admin_cc_stores_col_category()}
												</TableHead>
												<TableHead>{m.admin_cc_stores_col_contact()}</TableHead>
												<TableHead>
													{m.admin_cc_stores_col_requested_at()}
												</TableHead>
												<TableHead className="w-[80px]" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{data?.pendingRegistrations.map((reg) => (
												<TableRow key={reg.id}>
													<TableCell className="font-medium">
														{reg.storeName}
													</TableCell>
													<TableCell>{reg.category ?? '—'}</TableCell>
													<TableCell>{reg.contactEmail ?? '—'}</TableCell>
													<TableCell>
														<span className="flex items-center text-muted-foreground">
															<HugeiconsIcon
																icon={Time01Icon}
																className="mr-2 size-4"
															/>
															{formatDistanceToNow(new Date(reg.createdAt), {
																addSuffix: true,
																locale: es,
															})}
														</span>
													</TableCell>
													<TableCell>
														<DropdownMenu>
															<DropdownMenuTrigger>
																<Button variant="ghost" className="h-8 w-8 p-0">
																	<HugeiconsIcon
																		icon={MoreHorizontalIcon}
																		className="size-4"
																	/>
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	onClick={() =>
																		setApproveDialog({
																			open: true,
																			registrationRequestId: reg.id,
																			storeName: reg.storeName,
																		})
																	}
																>
																	<HugeiconsIcon
																		icon={CheckmarkBadge01Icon}
																		className="mr-2 size-4 text-emerald-500"
																	/>
																	{m.admin_cc_stores_action_approve()}
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => {
																		rejectForm.reset();
																		setRejectDialog({
																			open: true,
																			registrationRequestId: reg.id,
																			storeName: reg.storeName,
																		});
																	}}
																>
																	<HugeiconsIcon
																		icon={Cancel01Icon}
																		className="mr-2 size-4 text-destructive"
																	/>
																	{m.admin_cc_stores_action_reject()}
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* ─── ACTIVAS ─── */}
				<TabsContent value="active">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_cc_stores_tab_active()}</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex justify-center py-8">
									<Spinner />
								</div>
							) : activeCount === 0 ? (
								<p className="py-8 text-center text-muted-foreground">
									{m.admin_cc_stores_active_empty()}
								</p>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{m.admin_cc_stores_col_name()}</TableHead>
												<TableHead>
													{m.admin_cc_stores_col_category()}
												</TableHead>
												<TableHead>{m.admin_cc_stores_col_floor()}</TableHead>
												<TableHead>{m.admin_cc_stores_col_contact()}</TableHead>
												<TableHead className="w-[80px]" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{data?.activeStores.map((store) => (
												<TableRow key={store.id}>
													<TableCell className="font-medium">
														{store.name}
													</TableCell>
													<TableCell>{store.category ?? '—'}</TableCell>
													<TableCell>{store.floor ?? '—'}</TableCell>
													<TableCell>{store.contactEmail ?? '—'}</TableCell>
													<TableCell>
														<DropdownMenu>
															<DropdownMenuTrigger>
																<Button variant="ghost" className="h-8 w-8 p-0">
																	<HugeiconsIcon
																		icon={MoreHorizontalIcon}
																		className="size-4"
																	/>
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	render={
																		<Link
																			to={localizeHref(`/stores/${store.id}`)}
																		/>
																	}
																>
																	<HugeiconsIcon
																		icon={LinkSquare01Icon}
																		className="mr-2 size-4"
																	/>
																	{m.admin_cc_stores_action_view_profile()}
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => {
																		suspendForm.reset();
																		setSuspendDialog({
																			open: true,
																			storeId: store.id,
																			storeName: store.name,
																			activeReservationsCount:
																				store._count.reservations,
																		});
																	}}
																>
																	<HugeiconsIcon
																		icon={Cancel01Icon}
																		className="mr-2 size-4 text-amber-500"
																	/>
																	{m.admin_cc_stores_action_suspend()}
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* ─── SUSPENDIDAS ─── */}
				<TabsContent value="suspended">
					<Card>
						<CardHeader>
							<CardTitle>{m.admin_cc_stores_tab_suspended()}</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex justify-center py-8">
									<Spinner />
								</div>
							) : suspendedCount === 0 ? (
								<p className="py-8 text-center text-muted-foreground">
									{m.admin_cc_stores_suspended_empty()}
								</p>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{m.admin_cc_stores_col_name()}</TableHead>
												<TableHead>
													{m.admin_cc_stores_col_category()}
												</TableHead>
												<TableHead>{m.admin_cc_stores_col_contact()}</TableHead>
												<TableHead className="w-[80px]" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{data?.suspendedStores.map((store) => (
												<TableRow key={store.id}>
													<TableCell className="font-medium">
														{store.name}
													</TableCell>
													<TableCell>{store.category ?? '—'}</TableCell>
													<TableCell>{store.contactEmail ?? '—'}</TableCell>
													<TableCell>
														<DropdownMenu>
															<DropdownMenuTrigger>
																<Button variant="ghost" className="h-8 w-8 p-0">
																	<HugeiconsIcon
																		icon={MoreHorizontalIcon}
																		className="size-4"
																	/>
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	render={
																		<Link
																			to={localizeHref(`/stores/${store.id}`)}
																		/>
																	}
																>
																	<HugeiconsIcon
																		icon={LinkSquare01Icon}
																		className="mr-2 size-4"
																	/>
																	{m.admin_cc_stores_action_view_profile()}
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() =>
																		setReactivateDialog({
																			open: true,
																			storeId: store.id,
																			storeName: store.name,
																		})
																	}
																>
																	<HugeiconsIcon
																		icon={CheckmarkBadge01Icon}
																		className="mr-2 size-4 text-emerald-500"
																	/>
																	{m.admin_cc_stores_action_reactivate()}
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* ─── APPROVE DIALOG ─── */}
			<Dialog
				open={approveDialog.open}
				onOpenChange={(open) => {
					if (!open) setApproveDialog({ open: false });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{m.admin_cc_stores_approve_dialog_title()}
						</DialogTitle>
						<DialogDescription>
							{approveDialog.open &&
								m.admin_cc_stores_approve_dialog_desc({
									storeName: approveDialog.storeName,
								})}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setApproveDialog({ open: false })}
							disabled={approveMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => {
								if (!approveDialog.open) return;
								approveMutation.mutate({
									registrationRequestId: approveDialog.registrationRequestId,
								});
							}}
							disabled={approveMutation.isPending}
						>
							{approveMutation.isPending
								? m.admin_cc_stores_approve_submitting()
								: m.admin_cc_stores_approve_confirm()}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ─── REJECT DIALOG ─── */}
			<Dialog
				open={rejectDialog.open}
				onOpenChange={(open) => {
					if (!open) setRejectDialog({ open: false });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{m.admin_cc_stores_reject_dialog_title()}</DialogTitle>
						<DialogDescription>
							{rejectDialog.open &&
								m.admin_cc_stores_reject_dialog_desc({
									storeName: rejectDialog.storeName,
								})}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleRejectSubmit} className="space-y-4">
						<rejectForm.Field name="reason">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										{m.admin_cc_stores_reject_reason_label()}
									</FieldLabel>
									<Textarea
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder={m.admin_cc_stores_reject_reason_placeholder()}
										rows={3}
										data-invalid={
											field.state.meta.errors.length > 0 ? true : undefined
										}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									<FieldError>{field.state.meta.errors[0]?.message}</FieldError>
								</Field>
							)}
						</rejectForm.Field>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setRejectDialog({ open: false })}
								disabled={rejectMutation.isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={rejectMutation.isPending}
							>
								{rejectMutation.isPending
									? m.admin_cc_stores_reject_submitting()
									: m.admin_cc_stores_reject_confirm()}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ─── SUSPEND DIALOG ─── */}
			<Dialog
				open={suspendDialog.open}
				onOpenChange={(open) => {
					if (!open) setSuspendDialog({ open: false });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{m.admin_cc_stores_suspend_dialog_title()}
						</DialogTitle>
						<DialogDescription>
							{suspendDialog.open &&
								m.admin_cc_stores_suspend_dialog_desc({
									storeName: suspendDialog.storeName,
								})}
						</DialogDescription>
					</DialogHeader>
					{suspendDialog.open && suspendDialog.activeReservationsCount > 0 && (
						<Alert>
							<HugeiconsIcon icon={Alert02Icon} className="size-4" />
							<AlertDescription>
								{m.admin_cc_stores_suspend_active_reservations_warning({
									count: suspendDialog.activeReservationsCount,
								})}
							</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleSuspendSubmit} className="space-y-4">
						<suspendForm.Field name="reason">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										{m.admin_cc_stores_suspend_reason_label()}
									</FieldLabel>
									<Textarea
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder={m.admin_cc_stores_suspend_reason_placeholder()}
										rows={3}
										data-invalid={
											field.state.meta.errors.length > 0 ? true : undefined
										}
										aria-invalid={field.state.meta.errors.length > 0}
									/>
									<FieldError>{field.state.meta.errors[0]?.message}</FieldError>
								</Field>
							)}
						</suspendForm.Field>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setSuspendDialog({ open: false })}
								disabled={suspendMutation.isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={suspendMutation.isPending}
							>
								{suspendMutation.isPending
									? m.admin_cc_stores_suspend_submitting()
									: m.admin_cc_stores_suspend_confirm()}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ─── REACTIVATE DIALOG ─── */}
			<Dialog
				open={reactivateDialog.open}
				onOpenChange={(open) => {
					if (!open) setReactivateDialog({ open: false });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{m.admin_cc_stores_reactivate_dialog_title()}
						</DialogTitle>
						<DialogDescription>
							{reactivateDialog.open &&
								m.admin_cc_stores_reactivate_dialog_desc({
									storeName: reactivateDialog.storeName,
								})}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setReactivateDialog({ open: false })}
							disabled={reactivateMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => {
								if (!reactivateDialog.open) return;
								reactivateMutation.mutate({
									storeId: reactivateDialog.storeId,
								});
							}}
							disabled={reactivateMutation.isPending}
						>
							{reactivateMutation.isPending
								? m.admin_cc_stores_reactivate_submitting()
								: m.admin_cc_stores_reactivate_confirm()}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
