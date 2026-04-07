import {
	Search01Icon,
	ShoppingBag01Icon,
	Tag01Icon,
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
import type { Route } from './+types/stores.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.stores_meta_title() },
	{ name: 'description', content: m.stores_meta_description() },
];

// TODO-MOCK: Replace with real data
const PLACEHOLDER_STORES = [
	{ id: '1', badge: 'Nuevo', hasPromo: true },
	{ id: '2', badge: null, hasPromo: false },
	{ id: '3', badge: null, hasPromo: true },
	{ id: '4', badge: 'Destacado', hasPromo: false },
	{ id: '5', badge: null, hasPromo: true },
	{ id: '6', badge: null, hasPromo: false },
	{ id: '7', badge: 'Nuevo', hasPromo: true },
	{ id: '8', badge: null, hasPromo: false },
] as const;

export default function StoresRoute() {
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

			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{PLACEHOLDER_STORES.map((store) => (
					<Card
						key={store.id}
						className="group overflow-hidden transition-shadow hover:shadow-md"
					>
						<div className="relative flex h-24 items-center justify-center bg-muted">
							<HugeiconsIcon
								icon={ShoppingBag01Icon}
								className="size-10 text-muted-foreground/40"
							/>
							{store.badge && (
								<Badge variant="secondary" className="absolute top-2 right-2">
									{store.badge}
								</Badge>
							)}
							{store.hasPromo && (
								<div className="absolute bottom-2 left-2">
									<Badge variant="default" className="gap-1">
										<HugeiconsIcon icon={Tag01Icon} className="size-3" />
										Promo
									</Badge>
								</div>
							)}
						</div>
						<CardHeader className="pb-1 pt-3">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent className="pb-3">
							<Skeleton className="h-3 w-20" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
