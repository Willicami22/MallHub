import {
	ArrowLeft01Icon,
	Building04Icon,
	Location01Icon,
	Search01Icon,
	ShoppingBag01Icon,
	Store02Icon,
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
import { Link } from 'react-router';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/mall-detail.route';

export const meta = ({ data }: Route.MetaArgs) => {
	const name = (data as { mallName?: string } | undefined)?.mallName;
	return [
		{
			title: name ? m.mall_detail_meta_title({ name }) : m.malls_meta_title(),
		},
	];
};

const STORE_PLACEHOLDER_COUNT = 8;

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
					{m.mall_detail_not_found_title()}
				</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{m.mall_detail_not_found_description()}
				</p>
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link to={localizeHref('/malls')} />}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
					{m.mall_detail_back_to_malls()}
				</Button>
			</div>
		</div>
	);
}

export default function MallDetailRoute({ params }: Route.ComponentProps) {
	const { mallId } = params;
	const trpc = useTRPC();

	const mallQuery = useQuery({
		...trpc.browse.getMall.queryOptions({ mallId }),
		retry: false,
	});

	const storesQuery = useQuery(
		trpc.browse.listStores.queryOptions({ mallId, limit: 50 }),
	);

	const mall = mallQuery.data?.mall;
	const stores = storesQuery.data?.stores;
	const isMallLoading = mallQuery.isPending;
	const isMallNotFound =
		!mallQuery.isPending && (mallQuery.isError || !mallQuery.data?.mall);
	const isStoresLoading = storesQuery.isPending;

	if (isMallNotFound) {
		return <NotFound />;
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
			{/* Mall header — Scenario 3: clicking "Cambiar mall" opens the selection screen */}
			<div className="mb-8 overflow-hidden rounded-xl border bg-card">
				{/* Hero image or gradient banner */}
				<div className="relative h-40 overflow-hidden bg-primary/5 sm:h-48">
					{mall?.heroImageUrl ? (
						<img
							src={mall.heroImageUrl}
							alt={mall.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center opacity-10">
							<HugeiconsIcon
								icon={Building04Icon}
								className="size-32 text-primary"
							/>
						</div>
					)}
					<div className="absolute inset-0 bg-linear-to-b from-transparent to-black/30" />

					{/* Change mall button — top-left overlay */}
					<div className="absolute top-3 left-3">
						<Button
							variant="secondary"
							size="sm"
							nativeButton={false}
							render={<Link to={localizeHref('/malls')} />}
							className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/95"
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
							{m.mall_detail_change_mall()}
						</Button>
					</div>
				</div>

				{/* Mall info */}
				<div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex flex-col gap-1.5">
						{isMallLoading ? (
							<>
								<Skeleton className="h-7 w-52" />
								<Skeleton className="h-4 w-36" />
							</>
						) : (
							<>
								<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
									{mall?.name}
								</h1>
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<HugeiconsIcon
										icon={Location01Icon}
										className="size-4 shrink-0"
									/>
									<span>{mall?.city}</span>
									<span aria-hidden="true">·</span>
									<span className="truncate">{mall?.address}</span>
								</div>
							</>
						)}
					</div>

					<div className="flex shrink-0 items-center gap-2">
						{isMallLoading ? (
							<Skeleton className="h-6 w-24" />
						) : (
							<Badge variant="secondary" className="gap-1">
								<HugeiconsIcon icon={Store02Icon} className="size-3" />
								{m.malls_store_count({ count: mall?.activeStoreCount ?? 0 })}
							</Badge>
						)}
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
				</div>

				{mall?.description && (
					<p className="border-t px-5 py-3 text-sm text-muted-foreground">
						{mall.description}
					</p>
				)}
			</div>

			{/* Stores section */}
			<div className="mb-6 flex flex-col gap-1">
				<h2 className="text-lg font-semibold tracking-tight text-foreground">
					{m.mall_detail_stores_title()}
				</h2>
				<p className="text-sm text-muted-foreground">
					{m.mall_detail_stores_subtitle()}
				</p>
			</div>

			{!isStoresLoading && stores?.length === 0 && (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon
							icon={ShoppingBag01Icon}
							className="size-6 text-muted-foreground"
						/>
					</div>
					<p className="text-sm text-muted-foreground">
						{m.mall_detail_stores_empty()}
					</p>
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{isStoresLoading
					? Array.from(
							{ length: STORE_PLACEHOLDER_COUNT },
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
					: stores?.map((store) => (
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
								<CardContent className="pb-3">
									<span className="text-xs text-muted-foreground">
										{store.category ?? '—'}
									</span>
								</CardContent>
							</Card>
						))}
			</div>
		</div>
	);
}
