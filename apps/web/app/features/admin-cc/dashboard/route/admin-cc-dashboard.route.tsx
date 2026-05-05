import {
	Alert02Icon,
	ArrowDown01Icon,
	ArrowUp01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	cn,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import {
	endOfDay,
	format,
	formatISO,
	parseISO,
	startOfDay,
	subDays,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/admin-cc-dashboard.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: `${m.admin_cc_dashboard_title()} | Admin CC` }];
}

type Period = '30d' | '90d' | 'custom';

function buildRange(period: Period, customStart: string, customEnd: string) {
	const now = new Date();
	if (period === '30d') {
		return {
			startDate: formatISO(startOfDay(subDays(now, 30))),
			endDate: formatISO(endOfDay(now)),
		};
	}
	if (period === '90d') {
		return {
			startDate: formatISO(startOfDay(subDays(now, 90))),
			endDate: formatISO(endOfDay(now)),
		};
	}
	// custom
	if (customStart && customEnd) {
		return {
			startDate: formatISO(startOfDay(parseISO(customStart))),
			endDate: formatISO(endOfDay(parseISO(customEnd))),
		};
	}
	return {
		startDate: formatISO(startOfDay(subDays(now, 30))),
		endDate: formatISO(endOfDay(now)),
	};
}

function TrendBadge({ change }: { change: number | null }) {
	if (change === null) {
		return (
			<span className="text-xs text-muted-foreground">
				{m.admin_cc_dashboard_no_prev_data()}
			</span>
		);
	}
	const positive = change >= 0;
	return (
		<span
			className={cn(
				'flex items-center gap-0.5 text-xs font-medium',
				positive
					? 'text-emerald-600 dark:text-emerald-500'
					: 'text-destructive',
			)}
		>
			<HugeiconsIcon
				icon={positive ? ArrowUp01Icon : ArrowDown01Icon}
				className="size-3"
			/>
			{Math.abs(change)}% {m.admin_cc_dashboard_vs_prev()}
		</span>
	);
}

export default function AdminCcDashboardRoute() {
	const [period, setPeriod] = useState<Period>('30d');
	const [customStart, setCustomStart] = useState('');
	const [customEnd, setCustomEnd] = useState('');
	const [dateRange, setDateRange] = useState(() => buildRange('30d', '', ''));

	const trpc = useTRPC();
	const { data, isLoading, isError } = useQuery(
		trpc.adminCc.dashboard.getKpis.queryOptions({
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
		}),
	);

	const handlePeriod = (p: Period) => {
		setPeriod(p);
		if (p !== 'custom') {
			setDateRange(buildRange(p, '', ''));
		}
	};

	const handleCustomApply = () => {
		if (!customStart || !customEnd) return;
		setDateRange(buildRange('custom', customStart, customEnd));
	};

	const chartConfig = useMemo(
		() => ({
			searches: {
				label: m.admin_cc_kpi_searches(),
				color: 'hsl(var(--chart-1))',
			},
			reservations: {
				label: m.admin_cc_kpi_reservations(),
				color: 'hsl(var(--chart-2))',
			},
		}),
		[],
	);

	const displayStart = (() => {
		try {
			return format(new Date(dateRange.startDate), 'dd/MM/yyyy');
		} catch {
			return '';
		}
	})();
	const displayEnd = (() => {
		try {
			return format(new Date(dateRange.endDate), 'dd/MM/yyyy');
		} catch {
			return '';
		}
	})();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{m.admin_cc_dashboard_title()}
					</h1>
					<p className="text-muted-foreground">
						{data?.mallName ?? m.admin_cc_dashboard_subtitle()}
					</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						{m.admin_cc_dashboard_analyzing()} {displayStart} — {displayEnd}
					</p>
				</div>

				{/* Period selector */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap gap-1.5">
						{(['30d', '90d', 'custom'] as Period[]).map((p) => (
							<Button
								key={p}
								size="sm"
								variant={period === p ? 'secondary' : 'ghost'}
								onClick={() => handlePeriod(p)}
							>
								{p === '30d'
									? m.admin_cc_dashboard_period_30d()
									: p === '90d'
										? m.admin_cc_dashboard_period_90d()
										: m.admin_cc_dashboard_period_custom()}
							</Button>
						))}
					</div>
					{period === 'custom' && (
						<div className="flex flex-wrap items-center gap-2">
							<label className="flex items-center gap-1.5 text-xs text-muted-foreground">
								{m.admin_cc_dashboard_custom_from()}
								<input
									type="date"
									value={customStart}
									max={customEnd || undefined}
									onChange={(e) => setCustomStart(e.target.value)}
									className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</label>
							<label className="flex items-center gap-1.5 text-xs text-muted-foreground">
								{m.admin_cc_dashboard_custom_to()}
								<input
									type="date"
									value={customEnd}
									min={customStart || undefined}
									onChange={(e) => setCustomEnd(e.target.value)}
									className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</label>
							<Button
								size="sm"
								onClick={handleCustomApply}
								disabled={!customStart || !customEnd}
							>
								{m.admin_cc_dashboard_custom_apply()}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Loading / Error */}
			{isLoading && (
				<div className="flex justify-center p-12 text-muted-foreground">
					{m.admin_cc_dashboard_loading()}
				</div>
			)}
			{isError && (
				<div className="text-destructive text-sm">
					{m.admin_cc_dashboard_error()}
				</div>
			)}

			{data && !isLoading && (
				<>
					{/* No-data banner */}
					{!data.hasData && (
						<div className="rounded-lg border border-dashed p-6 text-center">
							<p className="font-medium">{m.admin_cc_dashboard_no_data()}</p>
							<p className="text-sm text-muted-foreground mt-1">
								{m.admin_cc_dashboard_no_data_hint()}
							</p>
						</div>
					)}

					{/* KPI Cards */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_searches()}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1">
								<div className="text-2xl font-bold">
									{data.summary.searches.toLocaleString()}
								</div>
								<TrendBadge change={data.summary.searchesChange} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_reservations()}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1">
								<div className="text-2xl font-bold">
									{data.summary.reservations.toLocaleString()}
								</div>
								<TrendBadge change={data.summary.reservationsChange} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_conversion()}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1">
								<div className="text-2xl font-bold">
									{data.summary.conversionRate.toFixed(2)}%
								</div>
								<TrendBadge change={data.summary.conversionChange} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_stores()}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1">
								<div className="text-2xl font-bold">
									{data.summary.activeStores.toLocaleString()}
								</div>
								<span className="text-xs text-muted-foreground">
									{m.admin_cc_dashboard_no_prev_data()}
								</span>
							</CardContent>
						</Card>
					</div>

					{data.hasData && (
						<>
							{/* Trend chart */}
							<Card>
								<CardHeader>
									<CardTitle>{m.admin_cc_chart_title()}</CardTitle>
								</CardHeader>
								<CardContent>
									{data.trends.length === 0 ? (
										<div className="py-8 text-center text-muted-foreground">
											{m.admin_cc_chart_empty()}
										</div>
									) : (
										<div className="h-[300px] w-full">
											<ChartContainer
												config={chartConfig}
												className="w-full h-full"
											>
												<AreaChart
													data={data.trends}
													margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
												>
													<defs>
														<linearGradient
															id="fillSearches"
															x1="0"
															y1="0"
															x2="0"
															y2="1"
														>
															<stop
																offset="5%"
																stopColor="var(--color-searches)"
																stopOpacity={0.8}
															/>
															<stop
																offset="95%"
																stopColor="var(--color-searches)"
																stopOpacity={0.1}
															/>
														</linearGradient>
														<linearGradient
															id="fillReservations"
															x1="0"
															y1="0"
															x2="0"
															y2="1"
														>
															<stop
																offset="5%"
																stopColor="var(--color-reservations)"
																stopOpacity={0.8}
															/>
															<stop
																offset="95%"
																stopColor="var(--color-reservations)"
																stopOpacity={0.1}
															/>
														</linearGradient>
													</defs>
													<CartesianGrid
														strokeDasharray="3 3"
														vertical={false}
													/>
													<XAxis
														dataKey="date"
														tickLine={false}
														axisLine={false}
														tickMargin={8}
														tickFormatter={(v) =>
															new Date(v).toLocaleDateString(undefined, {
																month: 'short',
																day: 'numeric',
															})
														}
													/>
													<YAxis
														tickLine={false}
														axisLine={false}
														tickMargin={8}
													/>
													<ChartTooltip
														cursor={false}
														content={<ChartTooltipContent />}
													/>
													<ChartLegend content={<ChartLegendContent />} />
													<Area
														type="monotone"
														dataKey="searches"
														stroke="var(--color-searches)"
														fill="url(#fillSearches)"
														fillOpacity={0.4}
													/>
													<Area
														type="monotone"
														dataKey="reservations"
														stroke="var(--color-reservations)"
														fill="url(#fillReservations)"
														fillOpacity={0.4}
													/>
												</AreaChart>
											</ChartContainer>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Top stores & Top products */}
							<div className="grid gap-6 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>{m.admin_cc_top_stores_title()}</CardTitle>
										<CardDescription>
											{m.admin_cc_top_stores_subtitle()}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{data.topStores.length === 0 ? (
											<p className="text-sm text-muted-foreground">
												{m.admin_cc_top_stores_empty()}
											</p>
										) : (
											<ol className="space-y-3">
												{data.topStores.map((store, idx) => (
													<li
														key={store.storeId}
														className="flex items-center justify-between gap-3"
													>
														<div className="flex items-center gap-3 min-w-0">
															<span className="text-sm font-medium text-muted-foreground w-4 shrink-0">
																{idx + 1}.
															</span>
															<div className="min-w-0">
																<p className="text-sm font-medium truncate">
																	{store.name}
																</p>
																{store.category && (
																	<p className="text-xs text-muted-foreground">
																		{store.category}
																	</p>
																)}
															</div>
														</div>
														<Badge variant="secondary" className="shrink-0">
															{store.count} {m.admin_cc_reservations_count()}
														</Badge>
													</li>
												))}
											</ol>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>{m.admin_cc_top_products_title()}</CardTitle>
										<CardDescription>
											{m.admin_cc_top_products_subtitle()}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{data.topProducts.length === 0 ? (
											<p className="text-sm text-muted-foreground">
												{m.admin_cc_top_products_empty()}
											</p>
										) : (
											<ol className="space-y-3">
												{data.topProducts.map((product, idx) => (
													<li
														key={product.productId}
														className="flex items-center justify-between gap-3"
													>
														<div className="flex items-center gap-3 min-w-0">
															<span className="text-sm font-medium text-muted-foreground w-4 shrink-0">
																{idx + 1}.
															</span>
															<div className="min-w-0">
																<p className="text-sm font-medium truncate">
																	{product.name}
																</p>
																<p className="text-xs text-muted-foreground truncate">
																	{product.storeName}
																</p>
															</div>
														</div>
														<Badge variant="secondary" className="shrink-0">
															{product.count} {m.admin_cc_reservations_count()}
														</Badge>
													</li>
												))}
											</ol>
										)}
									</CardContent>
								</Card>
							</div>
						</>
					)}

					{/* Alerts — always visible regardless of date range */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HugeiconsIcon
									icon={Alert02Icon}
									className="size-4 text-amber-500"
								/>
								{m.admin_cc_alerts_title()}
							</CardTitle>
							<CardDescription>{m.admin_cc_alerts_subtitle()}</CardDescription>
						</CardHeader>
						<CardContent>
							{data.alerts.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									{m.admin_cc_alerts_empty()}
								</p>
							) : (
								<div className="space-y-2">
									{data.alerts.map((alert) => (
										<Alert
											key={alert.storeId}
											className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30"
										>
											<HugeiconsIcon
												icon={Alert02Icon}
												className="size-4 text-amber-500"
											/>
											<AlertTitle className="font-medium">
												{alert.name}
											</AlertTitle>
											<AlertDescription>
												{alert.type === 'OUT_OF_STOCK'
													? `${alert.count} ${m.admin_cc_alert_out_of_stock()}`
													: m.admin_cc_alert_no_products()}
											</AlertDescription>
										</Alert>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
