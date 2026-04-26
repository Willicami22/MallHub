import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldError,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Spinner,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { MallStatus } from '@/features/.server/prisma/generated/client';
import {
	ASSIGN_ADMIN_CC_FORM_OPTIONS,
	getAssignAdminCcFormDefaultValues,
	toAssignAdminCcSubmitData,
	useAssignAdminCcForm,
} from '@/features/admin-platform/users/components/assign-admin-cc.form';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';

type AssignAdminCcDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	adminCcUserId: string;
	adminCcUserName: string;
	onConfirm: (data: { mallId: string; adminCcUserId: string }) => Promise<void>;
	isSubmitting: boolean;
};

const getMallStatusLabel = (status: MallStatus): string => {
	if (status === 'ACTIVE') {
		return m.admin_users_assign_mall_status_active();
	}

	if (status === 'SUSPENDED') {
		return m.admin_users_assign_mall_status_suspended();
	}

	return m.admin_users_assign_mall_status_inactive();
};

export function AssignAdminCcDialog({
	open,
	onOpenChange,
	adminCcUserId,
	adminCcUserName,
	onConfirm,
	isSubmitting,
}: AssignAdminCcDialogProps) {
	const trpc = useTRPC();
	const [search, setSearch] = useState('');
	const [submitError, setSubmitError] = useState<string | null>(null);
	const assignAdminCcForm = useAssignAdminCcForm({
		...ASSIGN_ADMIN_CC_FORM_OPTIONS,
		defaultValues: getAssignAdminCcFormDefaultValues(),
		onSubmit: async ({ value, formApi }) => {
			const submitData = toAssignAdminCcSubmitData(value);
			if (!submitData) {
				return;
			}

			try {
				setSubmitError(null);
				await onConfirm({
					adminCcUserId,
					mallId: submitData.mallId,
				});
				formApi.reset();
				setSearch('');
			} catch (error) {
				setSubmitError(
					error instanceof Error ? error.message : m.auth_unexpected_error(),
				);
			}
		},
	});

	const mallsQuery = useQuery({
		...trpc.adminCcAssignments.listMalls.queryOptions({
			limit: 12,
			search: search.trim().length > 0 ? search.trim() : undefined,
		}),
		enabled: open,
	});

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void assignAdminCcForm.handleSubmit();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				onOpenChange(nextOpen);

				if (!nextOpen) {
					assignAdminCcForm.reset();
					setSearch('');
					setSubmitError(null);
				}
			}}
		>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{m.admin_users_assign_mall_title()}</DialogTitle>
					<DialogDescription>
						{m.admin_users_assign_mall_description({ name: adminCcUserName })}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-5">
					<Field>
						<FieldLabel htmlFor="assign-admin-cc-search">
							{m.admin_users_assign_mall_search_label()}
						</FieldLabel>
						<InputGroup>
							<InputGroupAddon align="inline-start">
								<HugeiconsIcon icon={Search01Icon} />
							</InputGroupAddon>
							<InputGroupInput
								id="assign-admin-cc-search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder={m.admin_users_assign_mall_search_placeholder()}
							/>
						</InputGroup>
					</Field>

					<assignAdminCcForm.Field name="mallId">
						{(mallField) => {
							const isInvalid =
								mallField.state.meta.isTouched && !mallField.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>
										{m.admin_users_assign_mall_select_label()}
									</FieldLabel>
									<div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-2">
										{mallsQuery.isLoading ? (
											<div className="flex items-center justify-center py-6">
												<Spinner />
											</div>
										) : mallsQuery.data?.malls.length ? (
											mallsQuery.data.malls.map((mall) => (
												<button
													key={mall.id}
													type="button"
													className={cn(
														'w-full rounded-md border px-3 py-2 text-left transition-colors',
														'border-border bg-muted/40 hover:bg-muted/70',
														mallField.state.value === mall.id &&
															'border-primary bg-primary/10',
													)}
													onClick={() => {
														mallField.handleChange(mall.id);
														setSubmitError(null);
													}}
												>
													<div className="flex items-start justify-between gap-3">
														<div className="min-w-0">
															<p className="truncate text-sm font-medium text-foreground">
																{mall.name}
															</p>
															<p className="text-xs text-muted-foreground">
																{mall.city}
															</p>
															<p className="mt-1 text-xs text-muted-foreground">
																{mall.adminCcUser
																	? m.admin_users_assign_mall_current_admin({
																			name: mall.adminCcUser.name,
																		})
																	: m.admin_users_assign_mall_unassigned()}
															</p>
														</div>
														<Badge variant="secondary">
															{getMallStatusLabel(mall.status)}
														</Badge>
													</div>
												</button>
											))
										) : (
											<p className="px-2 py-4 text-sm text-muted-foreground">
												{m.admin_users_assign_mall_empty()}
											</p>
										)}
									</div>
									<FieldError errors={mallField.state.meta.errors} />
								</Field>
							);
						}}
					</assignAdminCcForm.Field>

					{submitError ? (
						<p className="text-sm text-destructive">{submitError}</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							{m.admin_users_cancel()}
						</Button>
						<assignAdminCcForm.Subscribe
							selector={(state) => state.values.mallId}
						>
							{(selectedMallId) => (
								<Button
									type="submit"
									disabled={isSubmitting || selectedMallId.length === 0}
								>
									{isSubmitting ? (
										<>
											<Spinner />
											{m.admin_users_assign_mall_submitting()}
										</>
									) : (
										m.admin_users_assign_mall_submit()
									)}
								</Button>
							)}
						</assignAdminCcForm.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
