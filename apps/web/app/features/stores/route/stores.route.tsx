import { Search01Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
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
import type { Route } from './+types/stores.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.stores_meta_title() },
	{ name: 'description', content: m.stores_meta_description() },
];

const PLACEHOLDER_COUNT = 8;

export default function StoresRoute() {
	const trpc = useTRPC();
	const storesQuery = useQuery(trpc.browse.listStores.queryOptions({}));
	const stores = storesQuery.data?.stores;
	const isLoading = storesQuery.isPending;

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

			{!isLoading && stores?.length === 0 && (
				<p className="py-16 text-center text-sm text-muted-foreground">
					{m.stores_empty()}
				</p>
			)}

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
										{store.mall.name} · {store.mall.city}
									</span>
								</CardContent>
							</Card>
						))}
			</div>
		</div>
	);
}
