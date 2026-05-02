import { Card, CardContent, CardDescription, CardHeader } from '@mallhub/ui';
import type { DashboardMetric } from '@/features/store-admin-local/store-dashboard/types/dashboard.types';

type MetricCardsProps = {
	metrics: DashboardMetric[];
};

export function MetricCards({ metrics }: MetricCardsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{metrics.map((metric) => (
				<Card key={metric.key}>
					<CardHeader className="pb-2">
						<CardDescription className="text-xs font-medium uppercase tracking-wide">
							{metric.label}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-1 pb-4">
						<p className="text-2xl font-semibold tracking-tight">
							{metric.value}
						</p>
						<p className="text-xs text-muted-foreground">{metric.hint}</p>
						<p className="text-xs font-medium text-primary">
							{metric.deltaLabel}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
