import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useProductsUiStore } from '@/features/store-admin-local/products/store/products-ui.store';
import type { ProductVariant } from '@/features/store-admin-local/shared/types/domain.models';
import { useTRPC } from '@/features/trpc/trpc.context';

const productsKey = (storeId: string) =>
	['store-admin', 'products', storeId] as const;

export function useProducts(storeId: string | null) {
	const queryClient = useQueryClient();
	const search = useProductsUiStore((state) => state.search);
	const trpc = useTRPC();

	const listQuery = useQuery({
		...trpc.storeAdminLocal.listMyStoreProducts.queryOptions({
			storeId: storeId ?? '',
		}),
		enabled: Boolean(storeId),
	});

	const upsertMutation = useMutation({
		...trpc.storeAdminLocal.upsertProduct.mutationOptions(),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: productsKey(variables.storeId),
			});
		},
	});

	const deleteMutation = useMutation({
		...trpc.storeAdminLocal.deleteProduct.mutationOptions(),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: productsKey(variables.storeId),
			});
		},
	});

	const getImageUploadUrlMutation = useMutation({
		...trpc.storeAdminLocal.getProductImageUploadUrl.mutationOptions(),
	});

	const filtered = useMemo(() => {
		const rows = listQuery.data?.products ?? [];
		const term = search.trim().toLowerCase();
		if (!term) {
			return rows;
		}
		return rows.filter(
			(product) =>
				product.name.toLowerCase().includes(term) ||
				product.variants.some((variant: ProductVariant) =>
					variant.sku.toLowerCase().includes(term),
				),
		);
	}, [listQuery.data, search]);

	const invalidate = useCallback(async () => {
		if (storeId) {
			await queryClient.invalidateQueries({ queryKey: productsKey(storeId) });
		}
	}, [queryClient, storeId]);

	return {
		products: filtered,
		allProducts: listQuery.data?.products ?? [],
		listQuery,
		upsertMutation,
		deleteMutation,
		getImageUploadUrlMutation,
		invalidate,
	};
}
