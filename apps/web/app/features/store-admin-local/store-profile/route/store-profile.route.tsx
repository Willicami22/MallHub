import { toast } from '@mallhub/ui';
import { useOutletContext } from 'react-router';
import {
	ListEmptyState,
	ResourceBoundary,
	TableSkeletonRows,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import { PromotionCreateForm } from '@/features/store-admin-local/store-profile/components/promotion-create-form';
import { PromotionHistory } from '@/features/store-admin-local/store-profile/components/promotion-history';
import { StoreProfileEditor } from '@/features/store-admin-local/store-profile/components/store-profile-editor';
import { useStoreProfile } from '@/features/store-admin-local/store-profile/hooks/use-store-profile';
import type { StoreProfileFormValues } from '@/features/store-admin-local/store-profile/schemas/store-profile.schemas';
import type { Route } from './+types/store-profile.route';

export const meta = () => [
	{ title: 'Perfil y promociones' },
	{ name: 'description', content: 'Perfil de tienda y promociones.' },
];

export default function StoreProfileRoute(_props: Route.ComponentProps) {
	const { storeId: activeStoreId } = useOutletContext<{ storeId: string }>();
	const {
		profileQuery,
		updateMutation,
		getLogoUploadUrlMutation,
		getBannerUploadUrlMutation,
		promotionsQuery,
		createPromotionMutation,
	} = useStoreProfile(activeStoreId);

	const profileError =
		profileQuery.error && isServiceError(profileQuery.error)
			? profileQuery.error.message
			: (profileQuery.error?.message ?? null);

	const promosError =
		promotionsQuery.error && isServiceError(promotionsQuery.error)
			? promotionsQuery.error.message
			: (promotionsQuery.error?.message ?? null);

	const handleSaveProfile = async (values: StoreProfileFormValues) => {
		if (!activeStoreId) {
			return;
		}
		try {
			await updateMutation.mutateAsync({
				name: values.name,
				description:
					values.description.trim() === ''
						? undefined
						: values.description.trim(),
				logoImageUrl: values.logoImageUrl,
				bannerImageUrl:
					values.bannerImageUrl === '' ? undefined : values.bannerImageUrl,
				openHours: values.openHours,
				socialLinks: values.socialLinks,
			});
			toast.success('Perfil actualizado');
		} catch (error) {
			const message =
				error && isServiceError(error)
					? error.message
					: 'No se pudo guardar el perfil';
			toast.error(message);
		}
	};

	const storeData = profileQuery.data?.store ?? null;
	const promotionsData = promotionsQuery.data?.promotions ?? [];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Perfil y promociones
				</h1>
				<p className="text-sm text-muted-foreground">
					Editor de perfil + alta de campañas + historial en tablas.
				</p>
			</div>

			<ResourceBoundary
				isLoading={profileQuery.isLoading}
				isError={profileQuery.isError}
				errorMessage={profileError}
				isEmpty={!activeStoreId}
				onRetry={() => {
					void profileQuery.refetch();
				}}
				loadingFallback={<TableSkeletonRows rows={3} />}
				empty={
					<ListEmptyState
						title="Sin contexto de tienda"
						description="Selecciona una tienda activa para editar el perfil."
					/>
				}
			>
				<StoreProfileEditor
					store={storeData as any}
					onSave={handleSaveProfile}
					isSaving={updateMutation.isPending}
					getLogoUploadUrlMutation={getLogoUploadUrlMutation}
					getBannerUploadUrlMutation={getBannerUploadUrlMutation}
				/>
			</ResourceBoundary>

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
						onCreate={async (values) => {
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
						}}
					/>
					<PromotionHistory promotions={promotionsData as any} />
				</div>
			</ResourceBoundary>
		</div>
	);
}
