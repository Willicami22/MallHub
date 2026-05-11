import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	toast,
} from '@mallhub/ui';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import { ProductFormDialog } from '@/features/store-admin-local/products/components/product-form-dialog';
import { ProductsTable } from '@/features/store-admin-local/products/components/products-table';
import { useProducts } from '@/features/store-admin-local/products/hooks/use-products';
import { useProductsUiStore } from '@/features/store-admin-local/products/store/products-ui.store';
import {
	ListEmptyState,
	ResourceBoundary,
	TableSkeletonRows,
} from '@/features/store-admin-local/shared/components/resource-boundary';
import type {
	Product,
	ProductStatus,
} from '@/features/store-admin-local/shared/types/domain.models';
import { isServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import type { Route } from './+types/store-products.route';

export const meta = () => [
	{ title: 'Catálogo' },
	{ name: 'description', content: 'CRUD de productos y variantes.' },
];

export default function StoreProductsRoute(_props: Route.ComponentProps) {
	const { storeId: activeStoreId } = useOutletContext<{ storeId: string }>();
	const search = useProductsUiStore((state) => state.search);
	const setSearch = useProductsUiStore((state) => state.setSearch);
	const {
		products,
		allProducts,
		listQuery,
		upsertMutation,
		deleteMutation,
		getImageUploadUrlMutation,
	} = useProducts(activeStoreId);
	const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>(
		'all',
	);
	const [categoryFilter, setCategoryFilter] = useState('all');

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);

	const categories = useMemo(
		() =>
			Array.from(
				new Set(
					allProducts
						.map((product) => product.category?.trim())
						.filter((category): category is string => Boolean(category)),
				),
			).sort((left, right) => left.localeCompare(right)),
		[allProducts],
	);

	const visibleProducts = useMemo(() => {
		const term = search.trim().toLowerCase();

		return products.filter((product) => {
			if (statusFilter !== 'all' && product.status !== statusFilter) {
				return false;
			}

			if (
				categoryFilter !== 'all' &&
				(product.category ?? '') !== categoryFilter
			) {
				return false;
			}

			if (!term) {
				return true;
			}

			return (
				product.name.toLowerCase().includes(term) ||
				product.category?.toLowerCase().includes(term) ||
				product.variants.some((variant: Product['variants'][number]) =>
					variant.sku.toLowerCase().includes(term),
				)
			);
		});
	}, [categoryFilter, products, search, statusFilter]);

	const hasActiveFilters =
		search.trim().length > 0 ||
		statusFilter !== 'all' ||
		categoryFilter !== 'all';
	const showFilteredEmptyState =
		allProducts.length > 0 && visibleProducts.length === 0 && hasActiveFilters;

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

	const saveProduct = async (product: Product) => {
		if (!activeStoreId) {
			return;
		}

		await upsertMutation.mutateAsync({
			id: product.id,
			storeId: activeStoreId,
			name: product.name,
			category: product.category,
			description: product.description,
			basePriceCents: product.basePriceCents,
			priceDiscountCents: product.priceDiscountCents,
			status: product.status,
			isReservable: product.isReservable,
			images: product.images,
			isPublished: product.isPublished,
			variants: product.variants.map((variant) => ({
				id: variant.id,
				sku: variant.sku,
				label: variant.label,
				priceCents: variant.priceCents,
				stock: variant.stock,
			})),
		});
	};

	const handleDuplicate = async (product: Product) => {
		if (!activeStoreId) {
			return;
		}

		try {
			await upsertMutation.mutateAsync({
				storeId: activeStoreId,
				name: `${product.name} (copia)`,
				category: product.category,
				description: product.description,
				basePriceCents: product.basePriceCents,
				priceDiscountCents: product.priceDiscountCents,
				status: 'draft',
				isReservable: false,
				images: product.images,
				isPublished: false,
				variants: product.variants.map((variant) => ({
					sku: variant.sku,
					label: variant.label,
					priceCents: variant.priceCents,
					stock: variant.stock,
				})),
			});
			toast.success('Producto duplicado');
		} catch {
			toast.error('No se pudo duplicar');
		}
	};

	const handleToggleStatus = async (product: Product) => {
		const nextStatus = product.status === 'active' ? 'inactive' : 'active';

		try {
			await saveProduct({
				...product,
				status: nextStatus,
				isPublished: nextStatus === 'active',
			});
			toast.success(
				nextStatus === 'active' ? 'Producto activado' : 'Producto desactivado',
			);
		} catch {
			toast.error('No se pudo cambiar el estado');
		}
	};

	const handleToggleAvailability = async (product: Product) => {
		try {
			await saveProduct({
				...product,
				isReservable: !product.isReservable,
			});
			toast.success(
				!product.isReservable ? 'Producto disponible' : 'Producto sin stock',
			);
		} catch {
			toast.error('No se pudo cambiar la disponibilidad');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
				</div>
				<Button type="button" onClick={openCreate}>
					Nuevo producto
				</Button>
			</div>

			<div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
				<Input
					placeholder="Buscar por nombre, categoría o SKU…"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				<Select
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as 'all' | ProductStatus)
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Todos los estados" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Todos los estados</SelectItem>
						<SelectItem value="active">Activo</SelectItem>
						<SelectItem value="draft">Borrador</SelectItem>
						<SelectItem value="inactive">Inactivo</SelectItem>
						<SelectItem value="archived">Archivado</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={categoryFilter}
					onValueChange={(value) => setCategoryFilter(value ?? 'all')}
					disabled={categories.length === 0}
				>
					<SelectTrigger>
						<SelectValue placeholder="Todas las categorías" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Todas las categorías</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category} value={category}>
								{category}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						setSearch('');
						setStatusFilter('all');
						setCategoryFilter('all');
					}}
					disabled={!hasActiveFilters}
				>
					Limpiar filtros
				</Button>
			</div>

			<ResourceBoundary
				isLoading={listQuery.isLoading}
				isError={listQuery.isError}
				errorMessage={errorMessage}
				isEmpty={!activeStoreId}
				onRetry={() => {
					listQuery.refetch();
				}}
				loadingFallback={<TableSkeletonRows rows={6} />}
				empty={
					<ListEmptyState
						title="Sin contexto de tienda"
						description="Selecciona una tienda activa para ver el catálogo."
					/>
				}
			>
				{allProducts.length === 0 ? (
					<ListEmptyState
						title="Sin productos"
						description="No hay nada todavía."
					/>
				) : showFilteredEmptyState ? (
					<ListEmptyState
						title="Sin resultados"
						description="Prueba con otros filtros o borra la búsqueda."
					/>
				) : (
					<ProductsTable
						products={visibleProducts}
						onEdit={openEdit}
						onDuplicate={handleDuplicate}
						onToggleStatus={handleToggleStatus}
						onToggleAvailability={handleToggleAvailability}
						onDelete={(product) => {
							if (!activeStoreId) {
								return;
							}
							deleteMutation
								.mutateAsync({ productId: product.id, storeId: activeStoreId })
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
					getImageUploadUrlMutation={getImageUploadUrlMutation}
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
