import {
	Building04Icon,
	Search01Icon,
	ShoppingBag01Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Card,
	CardHeader,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/search.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.search_meta_title() },
	{ name: 'description', content: m.search_meta_description() },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'products' | 'stores';

type ProductResult = {
	id: string;
	name: string;
	category: string | null;
	priceOriginal: number;
	priceDiscount: number | null;
	stock: number;
	store: { id: string; name: string; mall: { id: string; name: string } };
};

type StoreResult = {
	id: string;
	name: string;
	category: string | null;
	floor: string | null;
	openHours: string | null;
	mall: { id: string; name: string; city: string };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
}

function normalize(str: string): string {
	return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function matches(
	term: string,
	...fields: (string | null | undefined)[]
): boolean {
	const t = normalize(term);
	return fields.some((f) => f && normalize(f).includes(t));
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
				active
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
			}`}
		>
			{label}
		</button>
	);
}

// ─── Product result card ──────────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductResult }) {
	const inStock = product.stock > 0;
	return (
		<Link to={localizeHref(`/products/${product.id}`)} className="group">
			<Card className="transition-shadow group-hover:shadow-md">
				<CardHeader className="py-3">
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
							<HugeiconsIcon
								icon={ShoppingBag01Icon}
								className="size-5 text-muted-foreground/60"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5">
								<span className="truncate text-sm font-semibold text-foreground">
									{product.name}
								</span>
								{!inStock && (
									<Badge
										variant="secondary"
										className="border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400"
									>
										{m.search_result_out_of_stock()}
									</Badge>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								{m.search_result_in_store({ store: product.store.name })}
								{product.category && ` · ${product.category}`}
							</p>
						</div>
						<div className="shrink-0 text-right">
							{product.priceDiscount !== null ? (
								<>
									<span className="block text-sm font-bold text-foreground">
										{formatPrice(product.priceDiscount)}
									</span>
									<span className="block text-xs text-muted-foreground line-through">
										{formatPrice(product.priceOriginal)}
									</span>
								</>
							) : (
								<span className="block text-sm font-bold text-foreground">
									{formatPrice(product.priceOriginal)}
								</span>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>
		</Link>
	);
}

// ─── Store result card ────────────────────────────────────────────────────────

function StoreCard({ store }: { store: StoreResult }) {
	return (
		<Link to={localizeHref(`/stores/${store.id}`)} className="group">
			<Card className="transition-shadow group-hover:shadow-md">
				<CardHeader className="py-3">
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
							<HugeiconsIcon
								icon={Building04Icon}
								className="size-5 text-muted-foreground/60"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5">
								<span className="truncate text-sm font-semibold text-foreground">
									{store.name}
								</span>
								{store.category && (
									<Badge
										variant="secondary"
										className="max-w-[8rem] truncate text-xs"
									>
										{store.category}
									</Badge>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								{store.mall.name} · {store.mall.city}
							</p>
						</div>
					</div>
				</CardHeader>
			</Card>
		</Link>
	);
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
	icon,
	title,
	count,
}: {
	icon: typeof ShoppingBag01Icon;
	title: string;
	count: number;
}) {
	return (
		<div className="mb-3 flex items-center gap-2">
			<HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
			<span className="text-sm font-semibold text-foreground">{title}</span>
			<span className="text-xs text-muted-foreground">({count})</span>
		</div>
	);
}

// ─── Main route ───────────────────────────────────────────────────────────────

const ALL_MALLS = 'all';

export default function SearchRoute() {
	const trpc = useTRPC();
	const [searchParams] = useSearchParams();
	const initialMall = searchParams.get('mall') ?? ALL_MALLS;

	const [query, setQuery] = useState('');
	const [filter, setFilter] = useState<FilterType>('all');
	const [selectedMallId, setSelectedMallId] = useState(initialMall);

	const mallsQuery = useQuery(trpc.browse.listMalls.queryOptions({}));
	const storesQuery = useQuery(
		trpc.browse.listStores.queryOptions({ limit: 50 }),
	);
	const productsQuery = useQuery(
		trpc.browse.listAllProducts.queryOptions({ limit: 100 }),
	);

	const allMalls = mallsQuery.data?.malls ?? [];
	const allStores = storesQuery.data?.stores ?? [];
	const allProducts = productsQuery.data?.products ?? [];

	const mallItems = useMemo(
		() => [
			{ value: ALL_MALLS, label: m.search_mall_all() },
			...allMalls.map((mall) => ({
				value: mall.id,
				label: `${mall.name} · ${mall.city}`,
			})),
		],
		[allMalls],
	);

	const trimmedQuery = query.trim();

	const { matchingProducts, matchingStores } = useMemo(() => {
		if (!trimmedQuery) return { matchingProducts: [], matchingStores: [] };

		const byMall = selectedMallId !== ALL_MALLS ? selectedMallId : null;

		const filteredProducts =
			filter === 'stores'
				? []
				: allProducts.filter((p) => {
						if (byMall && p.store.mall.id !== byMall) return false;
						return matches(trimmedQuery, p.name, p.category, p.store.name);
					});

		const filteredStores =
			filter === 'products'
				? []
				: allStores.filter((s) => {
						if (byMall && s.mall.id !== byMall) return false;
						return matches(
							trimmedQuery,
							s.name,
							s.category,
							s.mall.name,
							s.mall.city,
						);
					});

		return {
			matchingProducts: filteredProducts,
			matchingStores: filteredStores,
		};
	}, [trimmedQuery, filter, selectedMallId, allProducts, allStores]);

	const totalCount = matchingProducts.length + matchingStores.length;
	const hasResults = totalCount > 0;
	const hasQuery = trimmedQuery.length > 0;
	const isLoading =
		storesQuery.isPending || productsQuery.isPending || mallsQuery.isPending;

	return (
		<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
			{/* Header */}
			<div className="mb-8 flex flex-col gap-2">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{m.search_title()}
				</h1>
				<p className="text-sm text-muted-foreground">{m.search_subtitle()}</p>
			</div>

			{/* Search input + mall selector */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<HugeiconsIcon
						icon={Search01Icon}
						className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={m.nav_search_placeholder()}
						className="pl-9"
						autoFocus
					/>
				</div>
				<Select
					items={mallItems}
					value={selectedMallId}
					onValueChange={(value) => setSelectedMallId(value ?? ALL_MALLS)}
				>
					<SelectTrigger className="w-full sm:w-64">
						<SelectValue placeholder={m.search_mall_all()} />
					</SelectTrigger>
					<SelectContent>
						{mallItems.map((item) => (
							<SelectItem key={item.value} value={item.value}>
								{item.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Filter chips */}
			<div className="mb-6 flex flex-wrap gap-2">
				<FilterChip
					label={m.search_filter_all()}
					active={filter === 'all'}
					onClick={() => setFilter('all')}
				/>
				<FilterChip
					label={m.search_filter_products()}
					active={filter === 'products'}
					onClick={() => setFilter('products')}
				/>
				<FilterChip
					label={m.search_filter_stores()}
					active={filter === 'stores'}
					onClick={() => setFilter('stores')}
				/>
			</div>

			<Separator className="mb-6" />

			{/* States */}

			{/* Scenario 5: empty field */}
			{!hasQuery && (
				<div className="flex flex-col items-center gap-3 py-12 text-center">
					<div className="flex size-14 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon
							icon={Search01Icon}
							className="size-7 text-muted-foreground"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<p className="text-sm font-medium text-foreground">
							{m.search_empty_title()}
						</p>
						<p className="text-sm text-muted-foreground">
							{m.search_empty_subtitle()}
						</p>
					</div>
				</div>
			)}

			{/* Scenario 2: query present but no results */}
			{hasQuery && !isLoading && !hasResults && (
				<div className="flex flex-col items-center gap-3 py-12 text-center">
					<div className="flex size-14 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon
							icon={Tag01Icon}
							className="size-7 text-muted-foreground"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<p className="text-sm font-medium text-foreground">
							{m.search_no_results_title({ term: trimmedQuery })}
						</p>
						<p className="text-sm text-muted-foreground">
							{m.search_no_results_subtitle()}
						</p>
					</div>
				</div>
			)}

			{/* Scenario 1: results found */}
			{hasQuery && hasResults && (
				<div className="flex flex-col gap-6">
					{/* Result count */}
					<p className="text-xs text-muted-foreground">
						{totalCount === 1
							? m.search_result_count({ count: totalCount })
							: m.search_result_count_plural({ count: totalCount })}
					</p>

					{/* Products section — Scenario 3 */}
					{matchingProducts.length > 0 && (
						<div>
							<SectionHeader
								icon={ShoppingBag01Icon}
								title={m.search_section_products()}
								count={matchingProducts.length}
							/>
							<div className="flex flex-col gap-2">
								{matchingProducts.map((product) => (
									<ProductCard key={product.id} product={product} />
								))}
							</div>
						</div>
					)}

					{/* Stores section — Scenario 4 */}
					{matchingStores.length > 0 && (
						<div>
							<SectionHeader
								icon={Building04Icon}
								title={m.search_section_stores()}
								count={matchingStores.length}
							/>
							<div className="flex flex-col gap-2">
								{matchingStores.map((store) => (
									<StoreCard key={store.id} store={store} />
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
