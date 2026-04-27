import {
	Cancel01Icon,
	Clock01Icon,
	Location01Icon,
	Search01Icon,
	ShoppingBag01Icon,
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
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/stores.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.stores_meta_title() },
	{ name: 'description', content: m.stores_meta_description() },
];

const PLACEHOLDER_COUNT = 8;

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

function isOpenNow(openHours: string | null): boolean {
	if (!openHours) return false;
	const match = openHours.match(/(\d{1,2}):(\d{2})[–\-–](\d{1,2}):(\d{2})/u);
	if (!match) return false;
	const [, oh, om, ch, cm] = match.map(Number);
	const now = new Date();
	const nowMins = now.getHours() * 60 + now.getMinutes();
	return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}

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

export default function StoresRoute() {
	const trpc = useTRPC();
	const storesQuery = useQuery(
		trpc.browse.listStores.queryOptions({ limit: 50 }),
	);
	const stores = storesQuery.data?.stores;
	const isLoading = storesQuery.isPending;

	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [activeFloor, setActiveFloor] = useState<string | null>(null);
	const [openNow, setOpenNow] = useState(false);

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
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.stores_title()}
					</h1>
					<p className="text-sm text-muted-foreground">{m.stores_subtitle()}</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					nativeButton={false}
					render={<Link to={localizeHref('/search')} />}
				>
					<HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
					{m.nav_search()}
				</Button>
			</div>

			{/* Filter chips */}
			{!isLoading && stores && stores.length > 0 && (
				<div className="mb-6 space-y-2">
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

					{allFloors.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{allFloors.map((floor) => (
								<FilterChip
									key={floor}
									label={m.stores_floor({ floor })}
									active={activeFloor === floor}
									onClick={() =>
										setActiveFloor((prev) => (prev === floor ? null : floor))
									}
								/>
							))}
							<FilterChip
								label={m.stores_filter_open_now()}
								active={openNow}
								onClick={() => setOpenNow((prev) => !prev)}
							/>
						</div>
					)}
					{allFloors.length === 0 && (
						<div className="flex flex-wrap gap-2">
							<FilterChip
								label={m.stores_filter_open_now()}
								active={openNow}
								onClick={() => setOpenNow((prev) => !prev)}
							/>
						</div>
					)}
				</div>
			)}

			{/* Store count */}
			{!isLoading && stores && stores.length > 0 && (
				<div className="mb-4">
					<span className="text-sm text-muted-foreground">
						{m.stores_store_count({ count: filteredStores.length })}
					</span>
				</div>
			)}

			{/* Empty — no stores at all */}
			{!isLoading && stores?.length === 0 && (
				<p className="py-16 text-center text-sm text-muted-foreground">
					{m.stores_empty()}
				</p>
			)}

			{/* Empty — filters produced no results */}
			{!isLoading &&
				stores &&
				stores.length > 0 &&
				filteredStores.length === 0 && (
					<div className="flex flex-col items-center gap-4 py-16 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
							<HugeiconsIcon
								icon={Cancel01Icon}
								className="size-7 text-muted-foreground"
							/>
						</div>
						<p className="max-w-xs text-sm text-muted-foreground">
							{m.stores_empty_filtered()}
						</p>
						<Button variant="outline" size="sm" onClick={clearFilters}>
							{m.stores_filter_clear()}
						</Button>
					</div>
				)}

			{/* Grid */}
			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{isLoading
					? Array.from(
							{ length: PLACEHOLDER_COUNT },
							(_, i) => `skeleton-${i}`,
						).map((key) => (
							<Card key={key} className="overflow-hidden">
								<div className="flex h-24 items-center justify-center bg-muted">
									<HugeiconsIcon
										icon={ShoppingBag01Icon}
										className="size-10 text-muted-foreground/30"
									/>
								</div>
								<CardHeader className="pb-1 pt-3">
									<Skeleton className="h-4 w-32" />
								</CardHeader>
								<CardContent className="pb-3">
									<Skeleton className="h-3 w-20" />
								</CardContent>
							</Card>
						))
					: filteredStores.map((store) => (
							<Card
								key={store.id}
								className="group overflow-hidden transition-shadow hover:shadow-md"
							>
								<div className="relative flex h-24 items-center justify-center bg-muted">
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
											className="size-10 text-muted-foreground/40"
										/>
									)}
									{store.category && (
										<Badge
											variant="secondary"
											className="absolute top-2 right-2 max-w-[6rem] truncate"
										>
											{store.category}
										</Badge>
									)}
								</div>
								<CardHeader className="pb-1 pt-3">
									<span className="truncate text-sm font-semibold text-foreground">
										{store.name}
									</span>
								</CardHeader>
								<CardContent className="pb-3 space-y-1">
									<span className="text-xs text-muted-foreground">
										{store.mall.name} · {store.mall.city}
									</span>
									{(store.floor || store.openHours) && (
										<div className="flex flex-wrap gap-x-2 gap-y-0.5">
											{store.floor && (
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													<HugeiconsIcon
														icon={Location01Icon}
														className="size-3 shrink-0"
													/>
													{m.stores_floor({ floor: store.floor })}
												</span>
											)}
											{store.openHours && (
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													<HugeiconsIcon
														icon={Clock01Icon}
														className="size-3 shrink-0"
													/>
													{store.openHours}
												</span>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						))}
			</div>
		</div>
	);
}
