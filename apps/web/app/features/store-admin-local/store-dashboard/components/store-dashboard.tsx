import { DashboardSquare01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardDescription, CardHeader, CardTitle } from '@mallhub/ui';
import {
	ListEmptyState,
	MetricCardsSkeleton,
	ResourceBoundary,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import { MetricCards } from '@/features/store-admin-local/store-dashboard/components/metric-cards';
import { useDashboardMetrics } from '@/features/store-admin-local/store-dashboard/hooks/use-dashboard-metrics';

type StoreDashboardProps = {
	storeId: string | null;
};

export function StoreDashboard({ storeId }: StoreDashboardProps) {
	const metricsQuery = useDashboardMetrics(storeId);

	const errorMessage =
		metricsQuery.error && isServiceError(metricsQuery.error)
			? metricsQuery.error.message
			: (metricsQuery.error?.message ?? null);

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={DashboardSquare01Icon}
							className="size-5 text-primary"
						/>
					</div>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							Panel de tienda
						</h1>
						<p className="text-sm text-muted-foreground">
							Resumen operativo y señales clave (datos simulados hasta conectar
							Supabase).
						</p>
					</div>
				</div>
			</div>

			<ResourceBoundary
				isLoading={metricsQuery.isLoading}
				isError={metricsQuery.isError}
				errorMessage={errorMessage}
				isEmpty={!storeId}
				onRetry={() => {
					void metricsQuery.refetch();
				}}
				loadingFallback={<MetricCardsSkeleton />}
				empty={
					<ListEmptyState
						title="Selecciona una tienda"
						description="Activa un contexto de tienda para ver métricas."
					/>
				}
			>
				{metricsQuery.data ? (
					<MetricCards metrics={metricsQuery.data.metrics} />
				) : null}
			</ResourceBoundary>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Próximos pasos</CardTitle>
					<CardDescription className="text-sm">
						Conecta RPC de Supabase en `dashboard.service.ts` y mapea el DTO
						real.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
