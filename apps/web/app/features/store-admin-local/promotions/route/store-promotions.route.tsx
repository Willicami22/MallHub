import { toast } from '@mallhub/ui';
import { useOutletContext } from 'react-router';
import { PromotionCreateForm } from '@/features/store-admin-local/promotions/components/promotion-create-form';
import { PromotionHistory } from '@/features/store-admin-local/promotions/components/promotion-history';
import { usePromotions } from '@/features/store-admin-local/promotions/hooks/use-promotions';
import type { PromotionFormValues } from '@/features/store-admin-local/promotions/schemas/promotion.schemas';
import {
	ListEmptyState,
	ResourceBoundary,
	TableSkeletonRows,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import type { Promotion } from '@/features/store-admin-local/shared/types/domain.models';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import type { Route } from './+types/store-promotions.route';

export const meta = (_props: Route.MetaArgs) => [
	{ title: 'Promociones' },
	{
		name: 'description',
		content: 'Gestión de campañas y promociones de la tienda.',
	},
];

export default function StorePromotionsRoute(_props: Route.ComponentProps) {
	const { storeId: activeStoreId } = useOutletContext<{ storeId: string }>();
	const { promotionsQuery, createPromotionMutation } =
		usePromotions(activeStoreId);

	const promosError =
		promotionsQuery.error && isServiceError(promotionsQuery.error)
			? promotionsQuery.error.message
			: (promotionsQuery.error?.message ?? null);

	const handleCreate = async (values: PromotionFormValues) => {
		if (!activeStoreId) {
			return;
		}
		try {
			await createPromotionMutation.mutateAsync({
				storeId: activeStoreId,
				title: values.title,
				description: values.description,
				discountPercent: values.discountPercent,
				startsAt: new Date(values.startsAt).toISOString(),
				endsAt: new Date(values.endsAt).toISOString(),
			});
			toast.success('Promoción creada');
		} catch {
			toast.error('No se pudo crear la promoción');
		}
	};

	const promotionsData = promotionsQuery.data?.promotions ?? [];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Promociones</h1>
				<p className="text-sm text-muted-foreground">
					Crea campañas y consulta el historial de promociones de tu tienda.
				</p>
			</div>

			<ResourceBoundary
				isLoading={promotionsQuery.isLoading}
				isError={promotionsQuery.isError}
				errorMessage={promosError}
				isEmpty={!activeStoreId}
				onRetry={() => {
					void promotionsQuery.refetch();
				}}
				loadingFallback={<TableSkeletonRows rows={3} />}
				empty={
					<ListEmptyState
						title="Sin contexto de tienda"
						description="Activa una tienda para gestionar promociones."
					/>
				}
			>
				<div className="grid gap-6 lg:grid-cols-2">
					<PromotionCreateForm
						isSubmitting={createPromotionMutation.isPending}
						onCreate={handleCreate}
					/>
					<PromotionHistory promotions={promotionsData as Promotion[]} />
				</div>
			</ResourceBoundary>
		</div>
	);
}
