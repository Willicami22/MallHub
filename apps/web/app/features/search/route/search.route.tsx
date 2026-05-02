import {
	Building04Icon,
	Search01Icon,
	ShoppingBag01Icon,
	Tag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardHeader,
	Input,
	Separator,
	Skeleton,
	ToggleGroup,
	ToggleGroupItem,
} from '@mallhub/ui';
import { useState } from 'react';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/search.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.search_meta_title() },
	{ name: 'description', content: m.search_meta_description() },
];

const CATEGORIES = [
	{ value: 'all', label: 'Todo' },
	{ value: 'stores', label: m.nav_stores, icon: ShoppingBag01Icon },
	{ value: 'malls', label: m.nav_malls, icon: Building04Icon },
	{ value: 'promos', label: 'Promociones', icon: Tag01Icon },
] as const;

// TODO-MOCK: Replace with real data
const PLACEHOLDER_RESULTS = [
	{ id: '1', type: 'store' as const, badge: 'Promo activa' },
	{ id: '2', type: 'mall' as const, badge: null },
	{ id: '3', type: 'store' as const, badge: null },
	{ id: '4', type: 'store' as const, badge: 'Nuevo' },
] as const;

export default function SearchRoute() {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string>('all');

	return (
		<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-2">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{m.search_title()}
				</h1>
				<p className="text-sm text-muted-foreground">{m.search_subtitle()}</p>
			</div>

			<div className="mb-6 flex gap-2">
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
					/>
				</div>
				<Button>{m.nav_search()}</Button>
			</div>

			<div className="mb-6">
				<ToggleGroup
					value={[category]}
					onValueChange={(vals: readonly string[]) => {
						if (vals.length > 0) {
							setCategory(vals[0]);
						}
					}}
				>
					{CATEGORIES.map((cat) => (
						<ToggleGroupItem key={cat.value} value={cat.value}>
							{'icon' in cat && (
								<HugeiconsIcon icon={cat.icon} className="size-3.5" />
							)}
							{typeof cat.label === 'function' ? cat.label() : cat.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>

			<Separator className="mb-6" />

			<div className="flex flex-col gap-3">
				{query.length > 0 ? (
					PLACEHOLDER_RESULTS.map((result) => (
						<Card
							key={result.id}
							className="cursor-pointer transition-shadow hover:shadow-md"
						>
							<CardHeader className="py-3">
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
											<HugeiconsIcon
												icon={
													result.type === 'store'
														? ShoppingBag01Icon
														: Building04Icon
												}
												className="size-5 text-muted-foreground"
											/>
										</div>
										<div className="flex flex-col gap-1">
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
									{result.badge && (
										<Badge variant="secondary">{result.badge}</Badge>
									)}
								</div>
							</CardHeader>
						</Card>
					))
				) : (
					<div className="flex flex-col items-center gap-3 py-12 text-center">
						<div className="flex size-14 items-center justify-center rounded-full bg-muted">
							<HugeiconsIcon
								icon={Search01Icon}
								className="size-7 text-muted-foreground"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium text-foreground">
								{m.search_title()}
							</p>
							<p className="text-sm text-muted-foreground">
								{m.nav_search_placeholder()}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
