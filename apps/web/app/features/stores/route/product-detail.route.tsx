import {
	ArrowLeft01Icon,
	Building04Icon,
	FavouriteIcon,
	ShoppingBag01Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge, Button, Card, CardContent, Skeleton } from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { GuestAuthDialog } from '@/features/stores/components/guest-auth-dialog';
import {
	Badge,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	Input,
	Skeleton,
	Spinner,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import {
	buildProductReservationStepOnePath,
	encodeSelectedVariantsParam,
} from '@/features/reservations/lib/reservation-flow.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/product-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.stores_meta_title() },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
}

type VariantGroup = { type: string; options: string[] };

function parseVariants(json: string | null): VariantGroup[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(g): g is VariantGroup =>
				typeof g === 'object' &&
				typeof g.type === 'string' &&
				Array.isArray(g.options),
		);
	} catch {
		return [];
	}
}

// ─── Not found ────────────────────────────────────────────────────────────────

function NotFound() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={ShoppingBag01Icon}
						className="size-8 text-muted-foreground"
					/>
				</div>
				<h1 className="text-xl font-semibold text-foreground">
					{m.product_detail_not_found_title()}
				</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{m.product_detail_not_found_description()}
				</p>
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link to={localizeHref('/stores')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.product_detail_not_found_back()}
				</Button>
			</div>
		</div>
	);
}

// ─── Guest reserve modal ──────────────────────────────────────────────────────

function GuestReserveDialog({
	open,
	onClose,
	registerHref,
	loginHref,
}: {
	open: boolean;
	onClose: () => void;
	registerHref: string;
	loginHref: string;
}) {
	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onClose();
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{m.product_detail_reserve_guest_title()}</DialogTitle>
					<DialogDescription>
						{m.product_detail_reserve_guest_description()}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button nativeButton={false} render={<Link to={registerHref} />}>
						{m.product_detail_reserve_guest_register()}
					</Button>
					<Button
						variant="outline"
						nativeButton={false}
						render={<Link to={loginHref} />}
					>
						{m.product_detail_reserve_guest_login()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Variant selector ─────────────────────────────────────────────────────────

function VariantSelector({
	groups,
	selected,
	onSelect,
}: {
	groups: VariantGroup[];
	selected: Record<string, string>;
	onSelect: (type: string, option: string) => void;
}) {
	if (groups.length === 0) return null;

	return (
		<div className="flex flex-col gap-4">
			<span className="text-sm font-medium text-foreground">
				{m.product_detail_variants_title()}
			</span>
			{groups.map((group) => (
				<div key={group.type} className="flex flex-col gap-2">
					<span className="text-xs text-muted-foreground">{group.type}</span>
					<div className="flex flex-wrap gap-2">
						{group.options.map((option) => {
							const isActive = selected[group.type] === option;
							return (
								<button
									key={option}
									type="button"
									onClick={() => onSelect(group.type, option)}
									className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
										isActive
											? 'border-primary bg-primary text-primary-foreground'
											: 'border-border bg-background text-foreground hover:border-foreground/30'
									}`}
								>
									{option}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

function ReserveDialog({
	open,
	onClose,
	isSubmitting,
	defaultPickupFullName,
	defaultPickupPhone,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	isSubmitting: boolean;
	defaultPickupFullName: string;
	defaultPickupPhone: string;
	onSubmit: (values: {
		pickupFullName: string;
		pickupPhone: string;
		pickupNote: string;
		quantity: number;
	}) => Promise<void>;
}) {
	const [pickupFullName, setPickupFullName] = useState(defaultPickupFullName);
	const [pickupPhone, setPickupPhone] = useState(defaultPickupPhone);
	const [pickupNote, setPickupNote] = useState('');
	const [quantityInput, setQuantityInput] = useState('1');

	useEffect(() => {
		if (!open) return;
		setPickupFullName(defaultPickupFullName);
		setPickupPhone(defaultPickupPhone);
		setPickupNote('');
		setQuantityInput('1');
	}, [open, defaultPickupFullName, defaultPickupPhone]);

	const quantity = Number.parseInt(quantityInput, 10);
	const isQuantityValid = Number.isInteger(quantity) && quantity >= 1;
	const canSubmit =
		pickupFullName.trim().length > 0 &&
		pickupPhone.trim().length > 0 &&
		isQuantityValid;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit || isSubmitting) {
			return;
		}
		await onSubmit({
			pickupFullName: pickupFullName.trim(),
			pickupPhone: pickupPhone.trim(),
			pickupNote: pickupNote.trim(),
			quantity,
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onClose();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.product_detail_reserve_dialog_title()}</DialogTitle>
					<DialogDescription>
						{m.product_detail_reserve_dialog_description()}
					</DialogDescription>
				</DialogHeader>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="pickup-full-name">
								{m.product_detail_reserve_pickup_name_label()}
							</FieldLabel>
							<Input
								id="pickup-full-name"
								value={pickupFullName}
								onChange={(event) => setPickupFullName(event.target.value)}
								placeholder={m.product_detail_reserve_pickup_name_placeholder()}
								disabled={isSubmitting}
								autoComplete="name"
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="pickup-phone">
								{m.product_detail_reserve_pickup_phone_label()}
							</FieldLabel>
							<Input
								id="pickup-phone"
								value={pickupPhone}
								onChange={(event) => setPickupPhone(event.target.value)}
								placeholder={m.product_detail_reserve_pickup_phone_placeholder()}
								disabled={isSubmitting}
								autoComplete="tel"
							/>
						</Field>

						<Field data-invalid={!isQuantityValid}>
							<FieldLabel htmlFor="pickup-quantity">
								{m.product_detail_reserve_quantity_label()}
							</FieldLabel>
							<Input
								id="pickup-quantity"
								type="number"
								min={1}
								step={1}
								value={quantityInput}
								onChange={(event) => setQuantityInput(event.target.value)}
								aria-invalid={!isQuantityValid}
								disabled={isSubmitting}
							/>
							{!isQuantityValid && (
								<FieldError>
									{m.product_detail_reserve_quantity_invalid()}
								</FieldError>
							)}
						</Field>

						<Field>
							<FieldLabel htmlFor="pickup-note">
								{m.product_detail_reserve_note_label()}
							</FieldLabel>
							<Textarea
								id="pickup-note"
								value={pickupNote}
								onChange={(event) => setPickupNote(event.target.value)}
								placeholder={m.product_detail_reserve_note_placeholder()}
								disabled={isSubmitting}
								rows={3}
							/>
						</Field>
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
						>
							{m.product_detail_reserve_cancel()}
						</Button>
						<Button type="submit" disabled={!canSubmit || isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.product_detail_reserve_submitting()}
								</>
							) : (
								m.product_detail_reserve_confirm()
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// ─── Main route ───────────────────────────────────────────────────────────────

type GuestModal = 'reserve' | 'favorites' | null;

export default function ProductDetailRoute({ params }: Route.ComponentProps) {
	const { productId } = params;
	const trpc = useTRPC();
	const [guestModal, setGuestModal] = useState<GuestModal>(null);
	const session = useAppSession();
	const location = useLocation();
	const navigate = useNavigate();
	const [guestDialogOpen, setGuestDialogOpen] = useState(false);
	const [reserveDialogOpen, setReserveDialogOpen] = useState(false);

	const reserveMutation = useMutation(
		trpc.reservations.create.mutationOptions(),
	);

	const productQuery = useQuery({
		...trpc.browse.getProduct.queryOptions({ productId }),
		retry: false,
	});

	const product = productQuery.data?.product;
	const isNotFound =
		!productQuery.isPending &&
		(productQuery.isError || !productQuery.data?.product);

	const variantGroups = useMemo(
		() => parseVariants(product?.variantsJson ?? null),
		[product?.variantsJson],
	);
	const [selectedVariants, setSelectedVariants] = useState<
		Record<string, string>
	>({});
	useEffect(() => {
		setSelectedVariants(
			Object.fromEntries(
				variantGroups.map((group) => [group.type, group.options[0] ?? '']),
			),
		);
	}, [variantGroups]);

	const inStock = (product?.stock ?? 0) > 0;
	const storeId = product?.store.id;
	const returnTo = `${location.pathname}${location.search}${location.hash}`;
	const registerHref = withReturnTo(localizeHref('/auth/register'), returnTo);
	const loginHref = withReturnTo(localizeHref('/auth/login'), returnTo);

	if (isNotFound) {
		return <NotFound />;
	}

	const variantGroups = parseVariants(product?.variantsJson ?? null);
	const inStock = (product?.stock ?? 0) > 0;
	const storeId = product?.store.id;
	const returnTo = localizeHref(`/products/${productId}`);
	const handleReserveSubmit = async ({
		pickupFullName,
		pickupPhone,
		pickupNote,
		quantity,
	}: {
		pickupFullName: string;
		pickupPhone: string;
		pickupNote: string;
		quantity: number;
	}) => {
		if (!product) return;

		const selection = Object.entries(selectedVariants)
			.filter(([, option]) => option.trim().length > 0)
			.map(([type, option]) => ({ type, option }));

		try {
			await reserveMutation.mutateAsync({
				productId: product.id,
				quantity,
				pickupFullName,
				pickupPhone,
				pickupNote: pickupNote.length > 0 ? pickupNote : null,
				selectedVariants: selection,
			});
			setReserveDialogOpen(false);
			toast.success(m.product_detail_reserve_success_toast());
			navigate(localizeHref('/dashboard'));
		} catch (error) {
			if (error instanceof TRPCClientError) {
				toast.error(
					m.product_detail_reserve_error_toast({
						message: error.data?.message ?? m.auth_unexpected_error(),
					}),
				);
				return;
			}

			toast.error(
				m.product_detail_reserve_error_toast({
					message: m.auth_unexpected_error(),
				}),
			);
		}
	};

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			{/* Back to store */}
			<div className="mb-5">
				<Button
					variant="ghost"
					size="sm"
					nativeButton={false}
					render={
						<Link
							to={
								storeId
									? localizeHref(`/stores/${storeId}`)
									: localizeHref('/stores')
							}
						/>
					}
					className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
					{m.product_detail_back()}
				</Button>
			</div>

			{/* Product card */}
			<Card className="overflow-hidden">
				{/* Image placeholder with favorites button */}
				<div className="relative flex h-56 w-full items-center justify-center bg-muted sm:h-72">
					<HugeiconsIcon
						icon={ShoppingBag01Icon}
						className="size-20 text-muted-foreground/20"
					/>
					<Button
						variant="ghost"
						size="icon-sm"
						className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
						onClick={() => setGuestModal('favorites')}
					>
						<HugeiconsIcon icon={FavouriteIcon} className="size-5" />
						<span className="sr-only">{m.guest_auth_save_favorites()}</span>
					</Button>
				</div>

				<CardContent className="flex flex-col gap-6 p-5 sm:p-6">
					{/* Header: name + category + store breadcrumb */}
					<div className="flex flex-col gap-2">
						{productQuery.isPending ? (
							<>
								<Skeleton className="h-7 w-3/4" />
								<Skeleton className="h-4 w-1/3" />
							</>
						) : (
							<>
								{product?.category && (
									<div className="flex items-center gap-1.5">
										<HugeiconsIcon
											icon={Tag01Icon}
											className="size-3.5 text-muted-foreground"
										/>
										<span className="text-xs text-muted-foreground">
											{product.category}
										</span>
									</div>
								)}
								<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
									{product?.name}
								</h1>
								{product?.store && (
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<HugeiconsIcon
											icon={Building04Icon}
											className="size-3.5 shrink-0"
										/>
										<span>
											{product.store.name} · {product.store.mall.name}
										</span>
									</div>
								)}
							</>
						)}
					</div>

					{/* Price */}
					{productQuery.isPending ? (
						<div className="flex items-baseline gap-3">
							<Skeleton className="h-8 w-24" />
							<Skeleton className="h-5 w-16" />
						</div>
					) : (
						<div className="flex items-baseline gap-3">
							{product?.priceDiscount !== null &&
							product?.priceDiscount !== undefined ? (
								<>
									<span className="text-2xl font-bold text-foreground">
										{formatPrice(product.priceDiscount)}
									</span>
									<span className="text-base text-muted-foreground line-through">
										{formatPrice(product.priceOriginal ?? 0)}
									</span>
								</>
							) : (
								<span className="text-2xl font-bold text-foreground">
									{formatPrice(product?.priceOriginal ?? 0)}
								</span>
							)}
						</div>
					)}

					{/* Stock badge */}
					{productQuery.isPending ? (
						<Skeleton className="h-6 w-20" />
					) : (
						<div>
							{inStock ? (
								<Badge
									variant="secondary"
									className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400"
								>
									{m.product_detail_availability_in_stock()}
									{product && product.stock > 0 && product.stock <= 10 && (
										<>
											{' '}
											·{' '}
											{m.product_detail_availability_count({
												count: product.stock,
											})}
										</>
									)}
								</Badge>
							) : (
								<Badge
									variant="secondary"
									className="border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400"
								>
									{m.product_detail_availability_out_of_stock()}
								</Badge>
							)}
						</div>
					)}

					{/* Variants */}
					{!productQuery.isPending && variantGroups.length > 0 && (
						<VariantSelector
							groups={variantGroups}
							selected={selectedVariants}
							onSelect={(type, option) =>
								setSelectedVariants((previous) => ({
									...previous,
									[type]: option,
								}))
							}
						/>
					)}

					{/* Description */}
					{!productQuery.isPending && product?.description && (
						<div className="flex flex-col gap-1.5">
							<span className="text-sm font-medium text-foreground">
								{m.product_detail_description_label()}
							</span>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{product.description}
							</p>
						</div>
					)}

					{/* Reserve button */}
					<div className="pt-1">
						<Button
							className="w-full"
							disabled={
								!inStock || productQuery.isPending || reserveMutation.isPending
							}
							onClick={() => {
								if (inStock) setGuestModal('reserve');
								if (!inStock || !product) {
									return;
								}

								if (!session.data?.user) {
									setGuestDialogOpen(true);
									return;
								}

								const selectedVariantsQuery = Object.entries(selectedVariants)
									.filter(([, option]) => option.trim().length > 0)
									.map(([type, option]) => ({
										type,
										option,
									}));
								const reserveFlowQuery = new URLSearchParams();
								if (selectedVariantsQuery.length > 0) {
									reserveFlowQuery.set(
										'variants',
										encodeSelectedVariantsParam(selectedVariantsQuery),
									);
								}

								const reserveHref = buildProductReservationStepOnePath(
									product.id,
								);
								const reserveFlowHref =
									reserveFlowQuery.toString().length > 0
										? `${reserveHref}?${reserveFlowQuery.toString()}`
										: reserveHref;

								navigate(localizeHref(reserveFlowHref));
							}}
						>
							{reserveMutation.isPending ? (
								<>
									<Spinner />
									{m.product_detail_reserve_submitting()}
								</>
							) : inStock ? (
								m.product_detail_reserve_button()
							) : (
								m.product_detail_reserve_disabled()
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Guest modal — reserve or favorites */}
			<GuestAuthDialog
				open={guestModal !== null}
				onClose={() => setGuestModal(null)}
				returnTo={returnTo}
				title={
					guestModal === 'favorites'
						? m.guest_auth_favorites_title()
						: m.product_detail_reserve_guest_title()
				}
				description={
					guestModal === 'favorites'
						? m.guest_auth_favorites_description()
						: m.product_detail_reserve_guest_description()
				}
			{/* Guest reservation modal */}
			<GuestReserveDialog
				open={guestDialogOpen}
				onClose={() => setGuestDialogOpen(false)}
				registerHref={registerHref}
				loginHref={loginHref}
			/>

			<ReserveDialog
				open={reserveDialogOpen}
				onClose={() => setReserveDialogOpen(false)}
				isSubmitting={reserveMutation.isPending}
				defaultPickupFullName={session.data?.user.name ?? ''}
				defaultPickupPhone=""
				onSubmit={handleReserveSubmit}
			/>

			<div className="h-8" />
		</div>
	);
}
