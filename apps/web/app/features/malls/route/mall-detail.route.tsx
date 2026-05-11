import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Building04Icon,
	Calendar01Icon,
	Call02Icon,
	Clock01Icon,
	LinkSquare01Icon,
	Location01Icon,
	Megaphone01Icon,
	RefreshIcon,
	Search01Icon,
	ShoppingBag01Icon,
	Store02Icon,
	Tag01Icon,
	WifiOff01Icon,
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { useOnlineStatus } from '@/features/browse/use-online-status';
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
const PROMO_PLACEHOLDER_COUNT = 3;
const CAMPAIGN_PLACEHOLDER_COUNT = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

type OpenHourEntry = {
	day: string;
	open: string;
	close: string;
	closed: boolean;
};
type SocialLinks = Record<string, string>;

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function OfflinePage({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center gap-5 py-24 text-center">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon
					icon={WifiOff01Icon}
					className="size-10 text-muted-foreground"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<h2 className="text-lg font-semibold text-foreground">
					{m.mall_feed_offline_title()}
				</h2>
				<p className="max-w-sm text-sm text-muted-foreground">
					{m.mall_feed_offline_description()}
				</p>
			</div>
			<Button onClick={onRetry}>
				<HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
				{m.mall_feed_offline_retry()}
			</Button>
		</div>
	);
}

function OfflineBanner() {
	return (
		<div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400">
			<HugeiconsIcon icon={WifiOff01Icon} className="size-4 shrink-0" />
			<span>{m.mall_feed_offline_banner()}</span>
		</div>
	);
}

function SectionError({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center gap-3 py-10 text-center">
			<p className="text-sm text-muted-foreground">
				{m.mall_feed_section_error()}
			</p>
			<Button variant="outline" size="sm" onClick={onRetry}>
				<HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
				{m.mall_feed_section_retry()}
			</Button>
		</div>
	);
}

function SectionEmptyState({
	icon,
	message,
}: {
	icon: typeof ShoppingBag01Icon;
	message: string;
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-10 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon icon={icon} className="size-6 text-muted-foreground" />
			</div>
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}

function SectionHeader({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) {
	return (
		<div className="mb-5 flex flex-col gap-1">
			<h2 className="text-lg font-semibold tracking-tight text-foreground">
				{title}
			</h2>
			<p className="text-sm text-muted-foreground">{subtitle}</p>
		</div>
	);
}

// ─── Gallery section ──────────────────────────────────────────────────────────

type GalleryImage = { id: string; imageUrl: string; label: string | null };

function GallerySection({ images }: { images: GalleryImage[] }) {
	if (images.length === 0) return null;

	return (
		<section className="mb-10" aria-label={m.mall_detail_gallery_title()}>
			<SectionHeader
				title={m.mall_detail_gallery_title()}
				subtitle={m.mall_detail_gallery_subtitle()}
			/>
			<div className="flex gap-3 overflow-x-auto pb-2">
				{images.map((img) => (
					<div
						key={img.id}
						className="relative h-44 w-72 shrink-0 overflow-hidden rounded-lg border bg-muted"
					>
						<img
							src={img.imageUrl}
							alt={img.label ?? ''}
							className="h-full w-full object-cover"
							loading="lazy"
						/>
						{img.label && (
							<div className="absolute right-0 bottom-0 left-0 bg-black/40 px-2 py-1">
								<span className="text-xs text-white">{img.label}</span>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}

// ─── Open hours section ───────────────────────────────────────────────────────

function OpenHoursSection({ openHoursJson }: { openHoursJson: unknown }) {
	if (!Array.isArray(openHoursJson) || openHoursJson.length === 0) return null;
	const entries = openHoursJson as OpenHourEntry[];

	return (
		<section className="mb-10" aria-label={m.mall_detail_hours_title()}>
			<div className="mb-4 flex items-center gap-2">
				<HugeiconsIcon icon={Clock01Icon} className="size-5 text-foreground" />
				<h2 className="text-lg font-semibold tracking-tight text-foreground">
					{m.mall_detail_hours_title()}
				</h2>
			</div>
			<div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
				{entries.map((entry) => (
					<div
						key={entry.day}
						className="flex items-center justify-between gap-2"
					>
						<span className="text-sm font-medium text-foreground">
							{entry.day}
						</span>
						<span className="text-sm text-muted-foreground">
							{entry.closed
								? m.mall_detail_hours_closed()
								: `${entry.open} – ${entry.close}`}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}

// ─── Social links section ─────────────────────────────────────────────────────

function SocialLinksRow({ socialLinksJson }: { socialLinksJson: unknown }) {
	if (!socialLinksJson || typeof socialLinksJson !== 'object') return null;
	const links = socialLinksJson as SocialLinks;
	const entries = Object.entries(links).filter(
		([, url]) => typeof url === 'string' && url.length > 0,
	);
	if (entries.length === 0) return null;

	return (
		<div className="mt-2 flex flex-wrap gap-2">
			{entries.map(([platform, url]) => (
				<a
					key={platform}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
				>
					<HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" />
					<span className="capitalize">{platform}</span>
				</a>
			))}
		</div>
	);
}

// ─── Stores section ──────────────────────────────────────────────────────────

type Store = {
	id: string;
	name: string;
	category: string | null;
	logoImageUrl: string | null;
	mall: { id: string; name: string; city: string };
};

function StoresSection({
	mallId,
	stores,
	isLoading,
	isError,
	onRetry,
}: {
	mallId: string;
	stores: Store[] | undefined;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	return (
		<section className="mb-10" aria-label={m.mall_detail_stores_title()}>
			<div className="mb-5 flex items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<h2 className="text-lg font-semibold tracking-tight text-foreground">
						{m.mall_detail_stores_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.mall_detail_stores_subtitle()}
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					nativeButton={false}
					render={<Link to={localizeHref(`/malls/${mallId}/stores`)} />}
					className="shrink-0"
				>
					{m.mall_detail_view_directory()}
					<HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
				</Button>
			</div>
			{isError && !isLoading && <SectionError onRetry={onRetry} />}
			{!isLoading && !isError && stores?.length === 0 && (
				<SectionEmptyState
					icon={ShoppingBag01Icon}
					message={m.mall_detail_stores_empty()}
				/>
			)}
			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{isLoading
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
							<Link
								key={store.id}
								to={localizeHref(`/stores/${store.id}`)}
								className="group"
							>
								<Card className="overflow-hidden transition-shadow group-hover:shadow-md">
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
							</Link>
						))}
			</div>
		</section>
	);
}

// ─── Promotions section ───────────────────────────────────────────────────────

type Promotion = {
	id: string;
	title: string;
	description: string | null;
	startsAt: Date | null;
	endsAt: Date | null;
	store: { id: string; name: string; category: string | null };
};

function formatDate(date: Date | null): string {
	if (!date) return '';
	return new Intl.DateTimeFormat(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(date));
}

function PromotionsSection({
	promotions,
	isLoading,
	isError,
	onRetry,
}: {
	promotions: Promotion[] | undefined;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	return (
		<section className="mb-10" aria-label={m.mall_feed_promotions_title()}>
			<SectionHeader
				title={m.mall_feed_promotions_title()}
				subtitle={m.mall_feed_promotions_subtitle()}
			/>
			{isError && !isLoading && <SectionError onRetry={onRetry} />}
			{!isLoading && !isError && promotions?.length === 0 && (
				<SectionEmptyState
					icon={Tag01Icon}
					message={m.mall_feed_promotions_empty()}
				/>
			)}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading
					? Array.from(
							{ length: PROMO_PLACEHOLDER_COUNT },
							(_, i) => `skeleton-${i}`,
						).map((key) => (
							<Card key={key} className="p-4">
								<div className="flex flex-col gap-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-3.5 w-1/2" />
									<Skeleton className="mt-2 h-3 w-full" />
									<Skeleton className="h-3 w-4/5" />
								</div>
							</Card>
						))
					: promotions?.map((promo) => (
							<Card key={promo.id} className="flex flex-col gap-0">
								<CardHeader className="pb-2 pt-4">
									<div className="flex items-start justify-between gap-2">
										<span className="text-sm font-semibold leading-snug text-foreground">
											{promo.title}
										</span>
										<Badge variant="default" className="shrink-0 gap-1">
											<HugeiconsIcon icon={Tag01Icon} className="size-3" />
											{promo.endsAt
												? m.mall_feed_promotions_ends({
														date: formatDate(promo.endsAt),
													})
												: m.mall_feed_promotions_no_end()}
										</Badge>
									</div>
									<span className="text-xs text-muted-foreground">
										{promo.store.name}
										{promo.store.category && ` · ${promo.store.category}`}
									</span>
								</CardHeader>
								{promo.description && (
									<CardContent className="pb-4">
										<p className="line-clamp-2 text-sm text-muted-foreground">
											{promo.description}
										</p>
									</CardContent>
								)}
							</Card>
						))}
			</div>
		</section>
	);
}

// ─── Events section ───────────────────────────────────────────────────────────

type MallEvent = {
	id: string;
	name: string;
	description: string | null;
	startDate: Date;
	endDate: Date;
};

function EventsSection({
	events,
	isLoading,
	isError,
	onRetry,
}: {
	events: MallEvent[] | undefined;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	if (!isLoading && !isError && (!events || events.length === 0)) return null;

	return (
		<section className="mb-10" aria-label={m.mall_detail_events_title()}>
			<SectionHeader
				title={m.mall_detail_events_title()}
				subtitle={m.mall_detail_events_subtitle()}
			/>
			{isError && !isLoading && <SectionError onRetry={onRetry} />}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading
					? Array.from({ length: 2 }, (_, i) => `skeleton-${i}`).map((key) => (
							<Card key={key} className="p-4">
								<div className="flex flex-col gap-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-3.5 w-1/2" />
									<Skeleton className="mt-2 h-3 w-full" />
								</div>
							</Card>
						))
					: events?.map((event) => (
							<Card key={event.id} className="flex flex-col gap-0">
								<CardHeader className="pb-2 pt-4">
									<div className="flex items-start justify-between gap-2">
										<span className="text-sm font-semibold leading-snug text-foreground">
											{event.name}
										</span>
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<HugeiconsIcon
											icon={Calendar01Icon}
											className="size-3.5 shrink-0"
										/>
										<span>
											{m.mall_detail_event_dates({
												start: formatDate(event.startDate),
												end: formatDate(event.endDate),
											})}
										</span>
									</div>
								</CardHeader>
								{event.description && (
									<CardContent className="pb-4">
										<p className="line-clamp-2 text-sm text-muted-foreground">
											{event.description}
										</p>
									</CardContent>
								)}
							</Card>
						))}
			</div>
		</section>
	);
}

// ─── Campaigns section ────────────────────────────────────────────────────────

type Campaign = {
	id: string;
	name: string;
	advertiserName: string;
	imageUrl: string;
	destinationUrl: string;
};

function CampaignsSection({
	campaigns,
	isLoading,
	isError,
	onRetry,
}: {
	campaigns: Campaign[] | undefined;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	return (
		<section className="mb-10" aria-label={m.mall_feed_campaigns_title()}>
			<SectionHeader
				title={m.mall_feed_campaigns_title()}
				subtitle={m.mall_feed_campaigns_subtitle()}
			/>
			{isError && !isLoading && <SectionError onRetry={onRetry} />}
			{!isLoading && !isError && campaigns?.length === 0 && (
				<SectionEmptyState
					icon={Megaphone01Icon}
					message={m.mall_feed_campaigns_empty()}
				/>
			)}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading
					? Array.from(
							{ length: CAMPAIGN_PLACEHOLDER_COUNT },
							(_, i) => `skeleton-${i}`,
						).map((key) => (
							<Card key={key} className="overflow-hidden">
								<Skeleton className="h-36 w-full rounded-none" />
								<CardHeader className="pb-1 pt-3">
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-3 w-24" />
								</CardHeader>
							</Card>
						))
					: campaigns?.map((campaign) => (
							<Card key={campaign.id} className="overflow-hidden">
								<img
									src={campaign.imageUrl}
									alt={campaign.name}
									className="h-36 w-full object-cover"
									loading="lazy"
								/>
								<CardHeader className="pb-2 pt-3">
									<span className="text-sm font-semibold text-foreground">
										{campaign.name}
									</span>
									<span className="text-xs text-muted-foreground">
										{campaign.advertiserName}
									</span>
								</CardHeader>
								<CardContent className="pb-4">
									<Button
										size="sm"
										variant="outline"
										className="w-full"
										onClick={() =>
											globalThis.open(
												campaign.destinationUrl,
												'_blank',
												'noopener,noreferrer',
											)
										}
									>
										{m.landing_campaigns_cta()}
									</Button>
								</CardContent>
							</Card>
						))}
			</div>
		</section>
	);
}

// ─── Main route component ─────────────────────────────────────────────────────

export default function MallDetailRoute({ params }: Route.ComponentProps) {
	const { mallId } = params;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const isOnline = useOnlineStatus();

	const mallQuery = useQuery({
		...trpc.browse.getMall.queryOptions({ mallId }),
		retry: false,
	});

	const storesQuery = useQuery(
		trpc.browse.listStores.queryOptions({ mallId, limit: 50 }),
	);

	const promotionsQuery = useQuery(
		trpc.browse.listPromotions.queryOptions({ mallId }),
	);

	const eventsQuery = useQuery(
		trpc.browse.listMallEvents.queryOptions({ mallId }),
	);

	const campaignsQuery = useQuery(
		trpc.campaigns.listActive.queryOptions({ mallId }),
	);

	const mall = mallQuery.data?.mall;
	const stores = storesQuery.data?.stores;
	const promotions = promotionsQuery.data?.promotions;
	const events = eventsQuery.data?.events;
	const campaigns = campaignsQuery.data?.campaigns;

	const isMallLoading = mallQuery.isPending;
	const isMallNotFound =
		!mallQuery.isPending && (mallQuery.isError || !mallQuery.data?.mall);

	// Scenario 3: no data at all + offline → show full offline page
	const hasNoData = !mall && !stores && !promotions && !campaigns;
	const isFullOffline = !isOnline && hasNoData;

	const retryAll = () => {
		void queryClient.refetchQueries();
	};

	if (isMallNotFound && isOnline) {
		return <NotFound />;
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
			{/* Mall header */}
			<div className="mb-8 overflow-hidden rounded-xl border bg-card">
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

					{/* Scenario 3 (US-INV-02): change mall CTA */}
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

				<div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex gap-3">
						{/* Logo */}
						{mall?.logoImageUrl && (
							<div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
								<img
									src={mall.logoImageUrl}
									alt={mall.name}
									className="h-full w-full object-cover"
								/>
							</div>
						)}

						<div className="flex flex-col gap-1.5">
							{isMallLoading ? (
								<>
									<Skeleton className="h-7 w-52" />
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-4 w-28" />
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
									{mall?.phone && (
										<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
											<HugeiconsIcon
												icon={Call02Icon}
												className="size-4 shrink-0"
											/>
											<span>{mall.phone}</span>
										</div>
									)}
									{mall?.socialLinksJson && (
										<SocialLinksRow socialLinksJson={mall.socialLinksJson} />
									)}
								</>
							)}
						</div>
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
							render={<Link to={`${localizeHref('/search')}?mall=${mallId}`} />}
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

			{/* Scenario 3: offline — full page or sticky banner */}
			{isFullOffline ? (
				<OfflinePage onRetry={retryAll} />
			) : (
				<>
					{!isOnline && <OfflineBanner />}

					{/* Gallery (shown when data is ready and there are images) */}
					{mall?.galleryImages && mall.galleryImages.length > 0 && (
						<GallerySection images={mall.galleryImages} />
					)}

					{/* Open hours (shown when data is ready) */}
					{mall?.openHoursJson && (
						<OpenHoursSection openHoursJson={mall.openHoursJson} />
					)}

					{/* Scenario 1: content sections (read-only, no auth-gated actions) */}
					<StoresSection
						mallId={mallId}
						stores={stores}
						isLoading={storesQuery.isPending}
						isError={storesQuery.isError}
						onRetry={() => void storesQuery.refetch()}
					/>

					{/* Scenario 2: each section independently handles its empty state */}
					<PromotionsSection
						promotions={promotions}
						isLoading={promotionsQuery.isPending}
						isError={promotionsQuery.isError}
						onRetry={() => void promotionsQuery.refetch()}
					/>

					<EventsSection
						events={events}
						isLoading={eventsQuery.isPending}
						isError={eventsQuery.isError}
						onRetry={() => void eventsQuery.refetch()}
					/>

					<CampaignsSection
						campaigns={campaigns}
						isLoading={campaignsQuery.isPending}
						isError={campaignsQuery.isError}
						onRetry={() => void campaignsQuery.refetch()}
					/>
				</>
			)}
		</div>
	);
}
