import {
	ArrowLeft01Icon,
	Building04Icon,
	Call02Icon,
	Clock01Icon,
	FavouriteIcon,
	Location01Icon,
	Mail01Icon,
	ShoppingBag01Icon,
	StarIcon,
	Tag01Icon,
	UserAccountIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	Skeleton,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { GuestAuthDialog } from '@/features/stores/components/guest-auth-dialog';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/store-detail.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.stores_meta_title() },
];

type Tab = 'catalog' | 'info' | 'reviews';

const PRODUCT_PLACEHOLDER_COUNT = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
}

// ─── Not found ────────────────────────────────────────────────────────────────

function NotFound() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={Building04Icon}
						className="size-8 text-muted-foreground"
					/>
				</div>
				<h1 className="text-xl font-semibold text-foreground">
					{m.store_detail_not_found_title()}
				</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{m.store_detail_not_found_description()}
				</p>
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link to={localizeHref('/stores')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.store_detail_back()}
				</Button>
			</div>
		</div>
	);
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({
	active,
	onChange,
}: {
	active: Tab;
	onChange: (tab: Tab) => void;
}) {
	const tabs: { id: Tab; label: string }[] = [
		{ id: 'catalog', label: m.store_detail_tab_catalog() },
		{ id: 'info', label: m.store_detail_tab_info() },
		{ id: 'reviews', label: m.store_detail_tab_reviews() },
	];

	return (
		<div className="mb-6 flex border-b">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					onClick={() => onChange(tab.id)}
					className={`px-4 py-2.5 text-sm font-medium transition-colors ${
						active === tab.id
							? 'border-b-2 border-primary text-foreground'
							: 'text-muted-foreground hover:text-foreground'
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}

// ─── Catalog tab ──────────────────────────────────────────────────────────────

type Product = {
	id: string;
	name: string;
	category: string | null;
	description: string | null;
	priceOriginal: number;
	priceDiscount: number | null;
	stock: number;
};

function CatalogTab({
	products,
	isLoading,
}: {
	products: Product[] | undefined;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
				{Array.from(
					{ length: PRODUCT_PLACEHOLDER_COUNT },
					(_, i) => `skeleton-${i}`,
				).map((key) => (
					<Card key={key} className="overflow-hidden">
						<div className="flex h-40 items-center justify-center bg-muted">
							<HugeiconsIcon
								icon={ShoppingBag01Icon}
								className="size-10 text-muted-foreground/20"
							/>
						</div>
						<CardHeader className="pb-1 pt-3">
							<Skeleton className="h-4 w-36" />
						</CardHeader>
						<CardContent className="pb-4">
							<Skeleton className="h-4 w-20" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!products || products.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 py-16 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={ShoppingBag01Icon}
						className="size-7 text-muted-foreground"
					/>
				</div>
				<p className="max-w-xs text-sm text-muted-foreground">
					{m.store_detail_catalog_empty()}
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
			{products.map((product) => (
				<Link
					key={product.id}
					to={localizeHref(`/products/${product.id}`)}
					className="group"
				>
					<Card className="overflow-hidden transition-shadow group-hover:shadow-md">
						<div className="relative flex h-40 items-center justify-center bg-muted">
							<HugeiconsIcon
								icon={ShoppingBag01Icon}
								className="size-12 text-muted-foreground/20"
							/>
							{product.stock === 0 && (
								<Badge
									variant="secondary"
									className="absolute top-2 right-2 border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400"
								>
									Sin stock
								</Badge>
							)}
						</div>
						<CardHeader className="pb-1 pt-3">
							<span className="line-clamp-2 text-sm font-semibold text-foreground">
								{product.name}
							</span>
							{product.category && (
								<Badge
									variant="secondary"
									className="mt-1 w-fit max-w-[8rem] truncate text-xs"
								>
									{product.category}
								</Badge>
							)}
						</CardHeader>
						<CardContent className="pb-4">
							<div className="flex items-baseline gap-2">
								{product.priceDiscount !== null ? (
									<>
										<span className="text-sm font-bold text-foreground">
											{formatPrice(product.priceDiscount)}
										</span>
										<span className="text-xs text-muted-foreground line-through">
											{formatPrice(product.priceOriginal)}
										</span>
									</>
								) : (
									<span className="text-sm font-bold text-foreground">
										{formatPrice(product.priceOriginal)}
									</span>
								)}
							</div>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

type StoreInfo = {
	name: string;
	category: string | null;
	description: string | null;
	floor: string | null;
	openHours: string | null;
	phone: string | null;
	contactEmail: string | null;
	mall: { id: string; name: string; city: string };
};

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: typeof Location01Icon;
	label: string;
	value: string | null;
}) {
	return (
		<div className="flex items-start gap-3 py-3">
			<HugeiconsIcon
				icon={icon}
				className="mt-0.5 size-4 shrink-0 text-muted-foreground"
			/>
			<div className="flex flex-col gap-0.5">
				<span className="text-xs text-muted-foreground">{label}</span>
				<span className="text-sm text-foreground">
					{value ?? m.store_detail_info_not_available()}
				</span>
			</div>
		</div>
	);
}

function InfoTab({
	store,
	isLoading,
}: {
	store: StoreInfo | undefined;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<div className="flex flex-col divide-y rounded-xl border">
				{Array.from({ length: 5 }, (_, i) => `row-${i}`).map((key) => (
					<div key={key} className="flex items-center gap-3 px-4 py-3">
						<Skeleton className="h-4 w-4 shrink-0 rounded" />
						<div className="flex flex-col gap-1">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col divide-y rounded-xl border px-4">
			<InfoRow
				icon={Tag01Icon}
				label={m.store_detail_info_category()}
				value={store?.category ?? null}
			/>
			<InfoRow
				icon={Location01Icon}
				label={m.store_detail_info_floor()}
				value={store?.floor ?? null}
			/>
			<InfoRow
				icon={Clock01Icon}
				label={m.store_detail_info_hours()}
				value={store?.openHours ?? null}
			/>
			<InfoRow
				icon={Call02Icon}
				label={m.store_detail_info_phone()}
				value={store?.phone ?? null}
			/>
			<InfoRow
				icon={Mail01Icon}
				label={m.store_detail_info_email()}
				value={store?.contactEmail ?? null}
			/>
			{store?.description && (
				<div className="py-3">
					<div className="mb-1.5 text-xs text-muted-foreground">
						{m.store_detail_info_description()}
					</div>
					<p className="text-sm text-foreground">{store.description}</p>
				</div>
			)}
		</div>
	);
}

// ─── Reviews tab ──────────────────────────────────────────────────────────────

function ReviewsTab() {
	return (
		<div className="flex flex-col items-center gap-4 py-16 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon
					icon={StarIcon}
					className="size-7 text-muted-foreground"
				/>
			</div>
			<p className="text-sm text-muted-foreground">
				{m.store_detail_reviews_empty()}
			</p>
			<div className="flex max-w-xs flex-col items-center gap-3 rounded-xl border bg-muted/30 px-5 py-4">
				<HugeiconsIcon
					icon={UserAccountIcon}
					className="size-8 text-muted-foreground"
				/>
				<p className="text-sm text-muted-foreground">
					{m.store_detail_reviews_guest_message()}
				</p>
				<Button
					size="sm"
					nativeButton={false}
					render={<Link to={localizeHref('/auth/register')} />}
				>
					{m.store_detail_reviews_register()}
				</Button>
			</div>
		</div>
	);
}

// ─── Main route ───────────────────────────────────────────────────────────────

export default function StoreDetailRoute({ params }: Route.ComponentProps) {
	const { storeId } = params;
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState<Tab>('catalog');
	const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);

	const storeQuery = useQuery({
		...trpc.browse.getStore.queryOptions({ storeId }),
		retry: false,
	});

	const productsQuery = useQuery(
		trpc.browse.listStoreProducts.queryOptions({ storeId, limit: 24 }),
	);

	const store = storeQuery.data?.store;
	const products = productsQuery.data?.products;

	const isStoreNotFound =
		!storeQuery.isPending && (storeQuery.isError || !storeQuery.data?.store);

	if (isStoreNotFound) {
		return <NotFound />;
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
			{/* Back */}
			<div className="mb-5">
				<Button
					variant="ghost"
					size="sm"
					nativeButton={false}
					render={<Link to={localizeHref('/stores')} />}
					className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
					{m.store_detail_back()}
				</Button>
			</div>

			{/* Header */}
			<div className="mb-6 flex items-start gap-4">
				<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
					{store?.logoImageUrl ? (
						<img
							src={store.logoImageUrl}
							alt={store.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<HugeiconsIcon
							icon={ShoppingBag01Icon}
							className="size-8 text-muted-foreground/40"
						/>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					{storeQuery.isPending ? (
						<>
							<Skeleton className="h-6 w-44" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
						</>
					) : (
						<>
							<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
								{store?.name}
							</h1>
							{store?.category && (
								<Badge variant="secondary" className="w-fit">
									{store.category}
								</Badge>
							)}
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								<HugeiconsIcon
									icon={Building04Icon}
									className="size-3.5 shrink-0"
								/>
								<span>
									{store?.mall.name} · {store?.mall.city}
								</span>
							</div>
						</>
					)}
				</div>

				<Button
					variant="ghost"
					size="icon-sm"
					className="ml-auto mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
					onClick={() => setFavoritesModalOpen(true)}
				>
					<HugeiconsIcon icon={FavouriteIcon} className="size-5" />
					<span className="sr-only">{m.guest_auth_save_favorites()}</span>
				</Button>
			</div>

			{/* Tabs */}
			<TabBar active={activeTab} onChange={setActiveTab} />

			{/* Tab content */}
			{activeTab === 'catalog' && (
				<CatalogTab products={products} isLoading={productsQuery.isPending} />
			)}
			{activeTab === 'info' && (
				<InfoTab store={store} isLoading={storeQuery.isPending} />
			)}
			{activeTab === 'reviews' && <ReviewsTab />}

			<div className="h-8" />

			<GuestAuthDialog
				open={favoritesModalOpen}
				onClose={() => setFavoritesModalOpen(false)}
				returnTo={localizeHref(`/stores/${storeId}`)}
				title={m.guest_auth_favorites_title()}
				description={m.guest_auth_favorites_description()}
			/>
		</div>
	);
}
