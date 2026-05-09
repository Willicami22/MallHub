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
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import {
	buildProductReservationStepOnePath,
	encodeSelectedVariantsParam,
} from '@/features/reservations/lib/reservation-flow.lib';
import { formatCop } from '@/features/shared/lib/format-cop.lib';
import { GuestAuthDialog } from '@/features/stores/components/guest-auth-dialog';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/product-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.stores_meta_title() },
];

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

// ─── Main route ───────────────────────────────────────────────────────────────

type GuestModal = 'reserve' | 'favorites' | null;

export default function ProductDetailRoute({ params }: Route.ComponentProps) {
	const { productId } = params;
	const trpc = useTRPC();
	const session = useAppSession();
	const location = useLocation();
	const navigate = useNavigate();
	const [guestModal, setGuestModal] = useState<GuestModal>(null);

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

	const inStock = (product?.stock ?? 0) > 0 && (product?.isReservable ?? false);
	const storeId = product?.store.id;
	const returnTo = `${location.pathname}${location.search}${location.hash}`;

	if (isNotFound) {
		return <NotFound />;
	}

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
				<div className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-muted sm:h-72">
					{product?.images?.[0] ? (
						<img
							src={product.images[0]}
							alt={product.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<HugeiconsIcon
							icon={ShoppingBag01Icon}
							className="size-20 text-muted-foreground/20"
						/>
					)}
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
										{formatCop(product.priceDiscount)}
									</span>
									<span className="text-base text-muted-foreground line-through">
										{formatCop(product.priceOriginal ?? 0)}
									</span>
								</>
							) : (
								<span className="text-2xl font-bold text-foreground">
									{formatCop(product?.priceOriginal ?? 0)}
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
							disabled={!inStock || productQuery.isPending}
							onClick={() => {
								if (!inStock || !product) return;

								if (!session.data?.user) {
									setGuestModal('reserve');
									return;
								}

								const selectedVariantsQuery = Object.entries(selectedVariants)
									.filter(([, option]) => option.trim().length > 0)
									.map(([type, option]) => ({ type, option }));
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
							{inStock
								? m.product_detail_reserve_button()
								: m.product_detail_reserve_disabled()}
						</Button>
					</div>
				</CardContent>
			</Card>

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
			/>

			<div className="h-8" />
		</div>
	);
}
