import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';

export function usePromotions(storeId: string | null) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const promotionsQuery = useQuery({
		...trpc.storeAdminLocal.listPromotions.queryOptions({
			storeId: storeId ?? '',
		}),
		enabled: Boolean(storeId),
	});

	const createPromotionMutation = useMutation({
		...trpc.storeAdminLocal.createPromotion.mutationOptions(),
		onSuccess: async () => {
			if (storeId) {
				await queryClient.invalidateQueries({
					queryKey: trpc.storeAdminLocal.listPromotions.queryKey({ storeId }),
				});
			}
		},
	});

	return {
		promotionsQuery,
		createPromotionMutation,
	};
}
