import {
	ArrowRight01Icon,
	Building04Icon,
	Search01Icon,
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
import type { Route } from './+types/malls.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.malls_meta_title() },
	{ name: 'description', content: m.malls_meta_description() },
];

const PLACEHOLDER_COUNT = 6;

export default function MallsRoute() {
	const trpc = useTRPC();
	const mallsQuery = useQuery(trpc.browse.listMalls.queryOptions({}));
	const malls = mallsQuery.data?.malls;
	const isLoading = mallsQuery.isPending;

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.malls_title()}
					</h1>
					<p className="text-sm text-muted-foreground">{m.malls_subtitle()}</p>
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

			{!isLoading && malls?.length === 0 && (
				<p className="py-16 text-center text-sm text-muted-foreground">
					{m.malls_empty()}
				</p>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading
					? Array.from(
							{ length: PLACEHOLDER_COUNT },
							(_, i) => `skeleton-${i}`,
						).map((key) => (
							<Card key={key} className="overflow-hidden">
								<div className="h-32 bg-primary/5" />
								<CardHeader className="pb-2 pt-4">
									<div className="flex items-start justify-between gap-2">
										<div className="flex flex-col gap-1">
											<Skeleton className="h-5 w-36" />
											<Skeleton className="h-3.5 w-24" />
										</div>
										<Skeleton className="h-5 w-20" />
									</div>
								</CardHeader>
								<CardContent className="pb-4">
									<div className="flex flex-col gap-2">
										<Skeleton className="h-3.5 w-full" />
										<Skeleton className="h-3.5 w-4/5" />
									</div>
								</CardContent>
							</Card>
						))
					: malls?.map((mall) => (
							<Link
								key={mall.id}
								to={localizeHref(`/malls/${mall.id}`)}
								className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
									<div className="relative h-32 overflow-hidden bg-primary/5">
										{mall.heroImageUrl ? (
											<img
												src={mall.heroImageUrl}
												alt={mall.name}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										) : (
											<div className="absolute inset-0 flex items-center justify-center opacity-10">
												<HugeiconsIcon
													icon={Building04Icon}
													className="size-24 text-primary"
												/>
											</div>
										)}
										<div className="absolute inset-0 bg-linear-to-b from-transparent to-background/20" />
									</div>
									<CardHeader className="pb-2 pt-4">
										<div className="flex items-start justify-between gap-2">
											<div className="flex flex-col gap-1">
												<span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
													{mall.name}
												</span>
												<span className="text-xs text-muted-foreground">
													{mall.city}
												</span>
											</div>
											<Badge variant="secondary">
												<HugeiconsIcon icon={Store02Icon} className="size-3" />
												{m.malls_store_count({ count: mall.activeStoreCount })}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pb-4">
										<div className="flex items-end justify-between gap-2">
											{mall.description ? (
												<p className="line-clamp-2 text-xs text-muted-foreground">
													{mall.description}
												</p>
											) : (
												<p className="text-xs text-muted-foreground">
													{mall.address}
												</p>
											)}
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
											/>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
			</div>
		</div>
	);
}
