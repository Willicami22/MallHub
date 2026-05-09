import {
	Alert02Icon,
	Calendar03Icon,
	DashboardSquare01Icon,
	ShoppingBag01Icon,
	Tag01Icon,
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
	Skeleton,
} from '@mallhub/ui';
import { useState } from 'react';
import { Link } from 'react-router';
import {
	ListEmptyState,
	ResourceBoundary,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import { useDashboardMetrics } from '@/features/store-admin-local/store-dashboard/hooks/use-dashboard-metrics';
import { localizeHref } from '@/paraglide/runtime.js';

type StoreDashboardProps = {
	storeId: string | null;
};

const numberFormatter = new Intl.NumberFormat('es-CO');

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }, (_, i) => (
					<div
						key={String(i)}
						className="flex flex-col gap-3 rounded-xl border p-4"
					>
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-3 w-32" />
					</div>
				))}
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<div className="flex flex-col gap-3 rounded-xl border p-4">
					<Skeleton className="h-5 w-40" />
					{Array.from({ length: 3 }, (_, i) => (
						<Skeleton key={String(i)} className="h-8 w-full" />
					))}
				</div>
				<div className="flex flex-col gap-3 rounded-xl border p-4">
					<Skeleton className="h-5 w-40" />
					{Array.from({ length: 3 }, (_, i) => (
						<Skeleton key={String(i)} className="h-10 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}

export function StoreDashboard({ storeId }: Readonly<StoreDashboardProps>) {
	const [period, setPeriod] = useState<'30d' | '90d'>('30d');
	const metricsQuery = useDashboardMetrics(storeId, period);

	const errorMessage =
		metricsQuery.error && isServiceError(metricsQuery.error)
			? metricsQuery.error.message
			: (metricsQuery.error?.message ?? null);

	const data = metricsQuery.data;
	const outOfStockProducts = data?.outOfStockProducts ?? [];
	const topProducts = data?.topProducts ?? [];
	const periodDays = period === '90d' ? '90' : '30';

	const statCards = [
		{
			key: 'completed',
			label: 'Reservas completadas',
			value: numberFormatter.format(data?.completedReservations ?? 0),
			hint: `Últimos ${periodDays} días`,
			icon: ShoppingBag01Icon,
		},
		{
			key: 'pending',
			label: 'Reservas pendientes',
			value: numberFormatter.format(data?.pendingReservations ?? 0),
			hint: 'En este momento',
			icon: Calendar03Icon,
		},
		{
			key: 'active',
			label: 'Publicaciones activas',
			value: numberFormatter.format(data?.activeListings ?? 0),
			hint: 'Productos publicados',
			icon: Tag01Icon,
		},
		{
			key: 'outOfStock',
			label: 'Sin stock',
			value: numberFormatter.format(outOfStockProducts.length),
			hint: 'Requieren atención',
			icon: Alert02Icon,
		},
	] as const;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={DashboardSquare01Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							Panel de tienda
						</h1>
						<p className="text-sm text-muted-foreground">
							Resumen de los últimos {periodDays} días
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex gap-1">
						<Button
							size="sm"
							variant={period === '30d' ? 'secondary' : 'ghost'}
							onClick={() => setPeriod('30d')}
						>
							30d
						</Button>
						<Button
							size="sm"
							variant={period === '90d' ? 'secondary' : 'ghost'}
							onClick={() => setPeriod('90d')}
						>
							90d
						</Button>
					</div>
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={<Link to={localizeHref('/store-local/products')} />}
					>
						Catálogo
					</Button>
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={<Link to={localizeHref('/store-local/reservations')} />}
					>
						Reservas
					</Button>
				</div>
			</div>

			<ResourceBoundary
				isLoading={metricsQuery.isLoading}
				isError={metricsQuery.isError}
				errorMessage={errorMessage}
				isEmpty={!storeId}
				onRetry={() => void metricsQuery.refetch()}
				loadingFallback={<DashboardSkeleton />}
				empty={
					<ListEmptyState
						title="Selecciona una tienda"
						description="Activa un contexto de tienda para ver métricas."
					/>
				}
			>
				<div className="space-y-6">
					{/* KPI Cards */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{statCards.map((stat) => (
							<Card key={stat.key}>
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardDescription className="text-xs font-medium uppercase tracking-wide">
											{stat.label}
										</CardDescription>
										<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
											<HugeiconsIcon
												icon={stat.icon}
												className="size-4 text-primary"
											/>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<div className="flex flex-col gap-1">
										<span className="text-2xl font-semibold tabular-nums">
											{stat.value}
										</span>
										<span className="text-xs text-muted-foreground">
											{stat.hint}
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Top products + Stock alerts */}
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Productos más reservados</CardTitle>
								<CardDescription>
									En los últimos {periodDays} días
								</CardDescription>
							</CardHeader>
							<CardContent>
								{topProducts.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										Sin reservas en este período.
									</p>
								) : (
									<ol className="space-y-3">
										{topProducts.map((product, idx) => (
											<li
												key={product.productId}
												className="flex items-center justify-between gap-3"
											>
												<div className="flex min-w-0 items-center gap-3">
													<span className="w-4 shrink-0 text-sm font-medium text-muted-foreground">
														{idx + 1}.
													</span>
													<p className="truncate text-sm font-medium">
														{product.name}
													</p>
												</div>
												<Badge variant="secondary" className="shrink-0">
													{product.count}{' '}
													{product.count === 1 ? 'reserva' : 'reservas'}
												</Badge>
											</li>
										))}
									</ol>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HugeiconsIcon
										icon={Alert02Icon}
										className="size-4 text-amber-500"
									/>
									Alertas de stock
								</CardTitle>
								<CardDescription>
									Productos activos sin disponibilidad para reserva
								</CardDescription>
							</CardHeader>
							<CardContent>
								{outOfStockProducts.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										Todos los productos tienen stock disponible.
									</p>
								) : (
									<div className="space-y-2">
										{outOfStockProducts.slice(0, 5).map((product) => (
											<Alert
												key={product.id}
												className="border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10"
											>
												<HugeiconsIcon
													icon={Alert02Icon}
													className="size-4 text-amber-500"
												/>
												<AlertTitle className="font-medium">
													{product.name}
												</AlertTitle>
												<AlertDescription>
													{product.isReservable
														? `Stock: ${product.stock}`
														: 'Marcado como sin stock'}
												</AlertDescription>
											</Alert>
										))}
										{outOfStockProducts.length > 5 && (
											<Link
												to={localizeHref('/store-local/products')}
												className="block text-xs font-medium text-primary underline-offset-2 hover:underline"
											>
												Ver {outOfStockProducts.length - 5} más en el catálogo →
											</Link>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</ResourceBoundary>
		</div>
	);
}
