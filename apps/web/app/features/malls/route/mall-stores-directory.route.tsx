import {
	ArrowLeft01Icon,
	Building04Icon,
	Cancel01Icon,
	Clock01Icon,
	Location01Icon,
	MapsIcon,
	ShoppingBag01Icon,
	ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge, Button, Card, Skeleton } from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/mall-stores-directory.route';

export const meta = ({ params }: Route.MetaArgs) => [
	{ title: m.mall_directory_meta_title({ mall: params.mallId }) },
];

const PLACEHOLDER_COUNT = 8;

type StoreEntry = {
	id: string;
	name: string;
	category: string | null;
	description: string | null;
	logoImageUrl: string | null;
	floor: string | null;
	openHours: string | null;
	mall: { id: string; name: string; city: string };
};

// ─── Category chips ───────────────────────────────────────────────────────────

const CATEGORY_CHIPS: { label: string; test: (cat: string) => boolean }[] = [
	{ label: 'Moda', test: (cat) => /moda/i.test(cat) },
	{
		label: 'Gastro',
		test: (cat) => /caf[eé]|gastro|restaur|aliment/i.test(cat),
	},
	{ label: 'Tech', test: (cat) => /tecn|tech|electr/i.test(cat) },
	{ label: 'Deportes', test: (cat) => /deport/i.test(cat) },
	{ label: 'Belleza', test: (cat) => /belle|cosmét|salud/i.test(cat) },
];

// ─── Open-now helper ──────────────────────────────────────────────────────────

function isOpenNow(openHours: string | null): boolean {
	if (!openHours) return false;
	// Handles both en-dash (–) and hyphen (-) separators, e.g. "10:00–21:00"
	const match = openHours.match(/(\d{1,2}):(\d{2})[–\-–](\d{1,2}):(\d{2})/u);
	if (!match) return false;
	const [, oh, om, ch, cm] = match.map(Number);
	const now = new Date();
	const nowMins = now.getHours() * 60 + now.getMinutes();
	return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}

// ─── Store list card ──────────────────────────────────────────────────────────

function StoreCard({ store }: { store: StoreEntry }) {
	return (
		<Card className="flex flex-row items-center gap-4 px-4 py-3">
			<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
				{store.logoImageUrl ? (
					<img
						src={store.logoImageUrl}
						alt={store.name}
						className="h-full w-full object-cover"
						loading="lazy"
					/>
				) : (
					<HugeiconsIcon
						icon={ShoppingBag01Icon}
						className="size-7 text-muted-foreground/40"
					/>
				)}
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

				<div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
					{store.floor && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							<HugeiconsIcon
								icon={Location01Icon}
								className="size-3 shrink-0"
							/>
							{m.mall_directory_floor({ floor: store.floor })}
						</span>
					)}
					{store.openHours && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							<HugeiconsIcon icon={Clock01Icon} className="size-3 shrink-0" />
							{m.mall_directory_open_hours({ hours: store.openHours })}
						</span>
					)}
				</div>
			</div>
		</Card>
	);
}

// ─── Map placeholder ──────────────────────────────────────────────────────────

function MapPlaceholder() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 py-24 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon
					icon={MapsIcon}
					className="size-8 text-muted-foreground"
				/>
			</div>
			<p className="text-sm text-muted-foreground">
				{m.mall_directory_map_coming_soon()}
			</p>
		</div>
	);
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

// ─── Main route ───────────────────────────────────────────────────────────────

export default function MallStoresDirectoryRoute({
	params,
}: Route.ComponentProps) {
	const { mallId } = params;
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [activeFloor, setActiveFloor] = useState<string | null>(null);
	const [openNow, setOpenNow] = useState(false);

	const mallQuery = useQuery({
		...trpc.browse.getMall.queryOptions({ mallId }),
		retry: false,
	});

	const storesQuery = useQuery(
		trpc.browse.listStores.queryOptions({ mallId, limit: 50 }),
	);

	const mall = mallQuery.data?.mall;
	const stores = storesQuery.data?.stores;
	const isLoading = storesQuery.isPending;
	const mallName = mall?.name ?? '';

	// Derive unique floor values from loaded data
	const allFloors = useMemo(() => {
		if (!stores) return [];
		const seen = new Set<string>();
		for (const s of stores) {
			if (s.floor) seen.add(s.floor);
		}
		return [...seen].sort((a, b) =>
			a.localeCompare(b, undefined, { numeric: true }),
		);
	}, [stores]);

	// In-memory filtering
	const filteredStores = useMemo(() => {
		if (!stores) return [];
		return stores.filter((store) => {
			if (activeCategory) {
				const chip = CATEGORY_CHIPS.find((c) => c.label === activeCategory);
				if (!chip || !store.category || !chip.test(store.category))
					return false;
			}
			if (activeFloor && store.floor !== activeFloor) return false;
			if (openNow && !isOpenNow(store.openHours)) return false;
			return true;
		});
	}, [stores, activeCategory, activeFloor, openNow]);

	const _hasActiveFilters =
		activeCategory !== null || activeFloor !== null || openNow;

	function clearFilters() {
		setActiveCategory(null);
		setActiveFloor(null);
		setOpenNow(false);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			{/* Back navigation */}
			<div className="mb-5">
				<Button
					variant="ghost"
					size="sm"
					nativeButton={false}
					render={<Link to={localizeHref(`/malls/${mallId}`)} />}
					className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
					{m.mall_directory_back()}
				</Button>
			</div>

			{/* Header */}
			<div className="mb-6">
				<div className="mb-1 flex items-center gap-2">
					<HugeiconsIcon
						icon={Building04Icon}
						className="size-5 text-muted-foreground"
					/>
					<span className="text-sm text-muted-foreground">{mallName}</span>
				</div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					{m.mall_directory_title()}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{m.mall_directory_subtitle()}
				</p>
			</div>

			{/* Filter chips */}
			{!isLoading && stores && stores.length > 0 && (
				<div className="mb-5 space-y-2">
					{/* Category chips */}
					<div className="flex flex-wrap gap-2">
						{CATEGORY_CHIPS.map((chip) => (
							<FilterChip
								key={chip.label}
								label={chip.label}
								active={activeCategory === chip.label}
								onClick={() =>
									setActiveCategory((prev) =>
										prev === chip.label ? null : chip.label,
									)
								}
							/>
						))}
					</div>

					{/* Floor + open-now chips */}
					{allFloors.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{allFloors.map((floor) => (
								<FilterChip
									key={floor}
									label={m.mall_directory_floor({ floor })}
									active={activeFloor === floor}
									onClick={() =>
										setActiveFloor((prev) => (prev === floor ? null : floor))
									}
								/>
							))}
							<FilterChip
								label={m.mall_directory_filter_open_now()}
								active={openNow}
								onClick={() => setOpenNow((prev) => !prev)}
							/>
						</div>
					)}
				</div>
			)}

			{/* Store count + tab switcher */}
			<div className="mb-5 flex items-center justify-between gap-3">
				<span className="text-sm text-muted-foreground">
					{isLoading ? (
						<Skeleton className="h-4 w-28" />
					) : (
						m.mall_directory_store_count({ count: filteredStores.length })
					)}
				</span>

				<div className="flex rounded-lg border p-0.5">
					<button
						type="button"
						onClick={() => setActiveTab('list')}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							activeTab === 'list'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						<HugeiconsIcon icon={ViewIcon} className="size-3.5" />
						{m.mall_directory_list_tab()}
					</button>
					<button
						type="button"
						onClick={() => setActiveTab('map')}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							activeTab === 'map'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						<HugeiconsIcon icon={MapsIcon} className="size-3.5" />
						{m.mall_directory_map_tab()}
					</button>
				</div>
			</div>

			{/* Content */}
			{activeTab === 'map' ? (
				<MapPlaceholder />
			) : isLoading ? (
				<div className="flex flex-col gap-3">
					{Array.from(
						{ length: PLACEHOLDER_COUNT },
						(_, i) => `skeleton-${i}`,
					).map((key) => (
						<Card
							key={key}
							className="flex flex-row items-center gap-4 px-4 py-3"
						>
							<Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-24" />
							</div>
						</Card>
					))}
				</div>
			) : stores?.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon
							icon={ShoppingBag01Icon}
							className="size-7 text-muted-foreground"
						/>
					</div>
					<p className="max-w-xs text-sm text-muted-foreground">
						{m.mall_directory_empty()}
					</p>
				</div>
			) : filteredStores.length === 0 ? (
				<div className="flex flex-col items-center gap-4 py-16 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon
							icon={Cancel01Icon}
							className="size-7 text-muted-foreground"
						/>
					</div>
					<p className="max-w-xs text-sm text-muted-foreground">
						{m.mall_directory_empty_filtered()}
					</p>
					<Button variant="outline" size="sm" onClick={clearFilters}>
						{m.mall_directory_filter_clear()}
					</Button>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{filteredStores.map((store) => (
						<StoreCard key={store.id} store={store} />
					))}
				</div>
			)}

			{/* Bottom padding for mobile nav */}
			<div className="h-8" />
		</div>
	);
}
