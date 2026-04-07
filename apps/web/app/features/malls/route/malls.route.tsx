import {
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
import { Link } from 'react-router';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/malls.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.malls_meta_title() },
	{ name: 'description', content: m.malls_meta_description() },
];

// TODO-MOCK: Replace with real data
const PLACEHOLDER_MALLS = [
	{ id: '1', stores: 120, floors: 3 },
	{ id: '2', stores: 85, floors: 2 },
	{ id: '3', stores: 200, floors: 4 },
	{ id: '4', stores: 60, floors: 2 },
	{ id: '5', stores: 95, floors: 3 },
	{ id: '6', stores: 150, floors: 4 },
] as const;

export default function MallsRoute() {
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
					render={<Link to={localizeHref('/search')} />}
				>
					<HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
					{m.nav_search()}
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{PLACEHOLDER_MALLS.map((mall) => (
					<Card
						key={mall.id}
						className="group overflow-hidden transition-shadow hover:shadow-md"
					>
						<div className="relative h-32 overflow-hidden bg-primary/5">
							<div className="absolute inset-0 flex items-center justify-center opacity-10">
								<HugeiconsIcon
									icon={Building04Icon}
									className="size-24 text-primary"
								/>
							</div>
							<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
						</div>
						<CardHeader className="pb-2 pt-4">
							<div className="flex items-start justify-between gap-2">
								<div className="flex flex-col gap-1">
									<Skeleton className="h-5 w-36" />
									<Skeleton className="h-3.5 w-24" />
								</div>
								<Badge variant="secondary">
									<HugeiconsIcon icon={Store02Icon} className="size-3" />
									{mall.stores} tiendas
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="pb-4">
							<div className="flex flex-col gap-2">
								<Skeleton className="h-3.5 w-full" />
								<Skeleton className="h-3.5 w-4/5" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
