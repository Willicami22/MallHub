import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
	type ProductUpsertDto,
	productService,
} from '@/features/store-admin-local/products/services/product.service';
import { useProductsUiStore } from '@/features/store-admin-local/products/store/products-ui.store';

const productsKey = (storeId: string) =>
	['store-admin', 'products', storeId] as const;

export function useProducts(storeId: string | null) {
	const queryClient = useQueryClient();
	const search = useProductsUiStore((state) => state.search);

	const listQuery = useQuery({
		queryKey: productsKey(storeId ?? 'none'),
		queryFn: async () => {
			if (!storeId) {
				return [];
			}
			return productService.listByStore(storeId);
		},
		enabled: Boolean(storeId),
	});

	const upsertMutation = useMutation({
		mutationFn: (dto: ProductUpsertDto) => productService.upsert(dto),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: productsKey(variables.storeId),
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: ({ productId }: { productId: string; sId: string }) =>
			productService.delete(productId),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: productsKey(variables.sId),
			});
		},
	});

	const filtered = useMemo(() => {
		const rows = listQuery.data ?? [];
		const term = search.trim().toLowerCase();
		if (!term) {
			return rows;
		}
		return rows.filter(
			(product) =>
				product.name.toLowerCase().includes(term) ||
				product.variants.some((variant) =>
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
		listQuery,
		upsertMutation,
		deleteMutation,
		invalidate,
	};
}
