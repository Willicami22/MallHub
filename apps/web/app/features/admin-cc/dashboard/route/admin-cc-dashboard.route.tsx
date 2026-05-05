import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { endOfMonth, formatISO, startOfMonth, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';

import type { Route } from './+types/admin-cc-dashboard.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: `${m.admin_cc_dashboard_title()} | Admin CC` }];
}

export default function AdminCcDashboardRoute() {
	// Estado inicial: Mes actual
	const [dateRange, setDateRange] = useState({
		startDate: formatISO(startOfMonth(new Date())),
		endDate: formatISO(endOfMonth(new Date())),
	});

	const trpc = useTRPC();

	// TRPC Query
	const { data, isLoading, isError } = useQuery(
		trpc.adminCc.dashboard.getKpis.queryOptions({
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
		}),
	);

	const handleFilterChange = (monthsBack: number) => {
		const now = new Date();
		const past = subMonths(now, monthsBack);
		setDateRange({
			startDate: formatISO(startOfMonth(past)),
			endDate: formatISO(endOfMonth(now)),
		});
	};

	const chartConfig = useMemo(
		() => ({
			visits: {
				label: m.admin_cc_kpi_visits(),
				color: 'hsl(var(--chart-1))',
			},
			reservations: {
				label: m.admin_cc_kpi_reservations(),
				color: 'hsl(var(--chart-2))',
			},
		}),
		[],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{m.admin_cc_dashboard_title()}
					</h1>
					<p className="text-muted-foreground">
						{m.admin_cc_dashboard_subtitle()}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => handleFilterChange(0)}
						className="px-3 py-1.5 text-sm font-medium border rounded hover:bg-muted"
					>
						{m.admin_cc_dashboard_filter_this_month()}
					</button>
					<button
						type="button"
						onClick={() => handleFilterChange(3)}
						className="px-3 py-1.5 text-sm font-medium border rounded hover:bg-muted"
					>
						{m.admin_cc_dashboard_filter_last_3_months()}
					</button>
					<button
						type="button"
						onClick={() => handleFilterChange(6)}
						className="px-3 py-1.5 text-sm font-medium border rounded hover:bg-muted"
					>
						{m.admin_cc_dashboard_filter_last_6_months()}
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center p-12 text-muted-foreground">
					{m.admin_cc_dashboard_loading()}
				</div>
			) : isError || !data ? (
				<div className="text-red-500">{m.admin_cc_dashboard_error()}</div>
			) : (
				<>
					{/* KPI Cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_visits()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{data.summary.totalVisits.toLocaleString()}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_reservations()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{data.summary.totalReservations.toLocaleString()}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_conversion()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{data.summary.conversionRate.toFixed(2)}%
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									{m.admin_cc_kpi_stores()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{data.summary.activeStores.toLocaleString()}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Trends Chart */}
					<Card className="col-span-4">
						<CardHeader>
							<CardTitle>{m.admin_cc_chart_title()}</CardTitle>
						</CardHeader>
						<CardContent>
							{data.trends.length === 0 ? (
								<div className="py-8 text-center text-muted-foreground">
									{m.admin_cc_chart_empty()}
								</div>
							) : (
								<div className="h-[350px] w-full">
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
													id="fillVisits"
													x1="0"
													y1="0"
													x2="0"
													y2="1"
												>
													<stop
														offset="5%"
														stopColor="var(--color-visits)"
														stopOpacity={0.8}
													/>
													<stop
														offset="95%"
														stopColor="var(--color-visits)"
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
											<CartesianGrid strokeDasharray="3 3" vertical={false} />
											<XAxis
												dataKey="date"
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												tickFormatter={(value) =>
													new Date(value).toLocaleDateString(undefined, {
														month: 'short',
														day: 'numeric',
													})
												}
											/>
											<YAxis tickLine={false} axisLine={false} tickMargin={8} />
											<ChartTooltip
												cursor={false}
												content={<ChartTooltipContent />}
											/>
											<ChartLegend content={<ChartLegendContent />} />
											<Area
												type="monotone"
												dataKey="visits"
												stroke="var(--color-visits)"
												fill="url(#fillVisits)"
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
				</>
			)}
		</div>
	);
}
