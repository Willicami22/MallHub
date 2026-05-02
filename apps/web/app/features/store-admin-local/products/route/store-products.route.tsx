import { Button, toast } from '@mallhub/ui';
import { useState } from 'react';
import { useAuth } from '@/features/store-admin-local/auth/hooks/use-auth';
import { ProductFormDialog } from '@/features/store-admin-local/products/components/product-form-dialog';
import { ProductsTable } from '@/features/store-admin-local/products/components/products-table';
import { useProducts } from '@/features/store-admin-local/products/hooks/use-products';
import { useProductsUiStore } from '@/features/store-admin-local/products/store/products-ui.store';
import {
	ListEmptyState,
	ResourceBoundary,
	TableSkeletonRows,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import type { Product } from '@/features/store-admin-local/shared/types/domain.models';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import type { Route } from './+types/store-products.route';

export const meta = () => [
	{ title: 'Catálogo' },
	{ name: 'description', content: 'CRUD de productos y variantes.' },
];

export default function StoreProductsRoute(_props: Route.ComponentProps) {
	const { activeStoreId } = useAuth();
	const search = useProductsUiStore((state) => state.search);
	const setSearch = useProductsUiStore((state) => state.setSearch);
	const { products, listQuery, upsertMutation, deleteMutation } =
		useProducts(activeStoreId);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);

	const errorMessage =
		listQuery.error && isServiceError(listQuery.error)
			? listQuery.error.message
			: (listQuery.error?.message ?? null);

	const openCreate = () => {
		setEditing(null);
		setDialogOpen(true);
	};

	const openEdit = (product: Product) => {
		setEditing(product);
		setDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
					<p className="text-sm text-muted-foreground">
						Tabla + formulario con variantes. Nombres que incluyan{' '}
						<code className="text-xs">error@</code> simulan fallo al guardar.
					</p>
				</div>
				<Button type="button" onClick={openCreate}>
					Nuevo producto
				</Button>
			</div>

			<ResourceBoundary
				isLoading={listQuery.isLoading}
				isError={listQuery.isError}
				errorMessage={errorMessage}
				isEmpty={!activeStoreId}
				onRetry={() => {
					void listQuery.refetch();
				}}
				loadingFallback={<TableSkeletonRows rows={6} />}
				empty={
					<ListEmptyState
						title="Sin contexto de tienda"
						description="Selecciona una tienda activa para ver el catálogo."
					/>
				}
			>
				{products.length === 0 ? (
					<ListEmptyState
						title="Sin productos"
						description="Crea el primero con el botón superior."
					/>
				) : (
					<ProductsTable
						products={products}
						search={search}
						onSearchChange={setSearch}
						onEdit={openEdit}
						onDelete={(product) => {
							if (!activeStoreId) {
								return;
							}
							void deleteMutation
								.mutateAsync({ productId: product.id, sId: activeStoreId })
								.then(() => toast.success('Producto eliminado'))
								.catch(() => toast.error('No se pudo eliminar'));
						}}
					/>
				)}
			</ResourceBoundary>

			{activeStoreId ? (
				<ProductFormDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					storeId={activeStoreId}
					initial={editing}
					isSubmitting={upsertMutation.isPending}
					onSubmit={async (dto) => {
						try {
							await upsertMutation.mutateAsync(dto);
							toast.success('Producto guardado');
						} catch {
							toast.error('No se pudo guardar');
						}
					}}
				/>
			) : null}
		</div>
	);
}
