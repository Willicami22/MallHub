import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';

export function useStoreProfile(storeId: string | null) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const profileQuery = useQuery({
		...trpc.storeAdminLocal.getMyStore.queryOptions(),
		enabled: Boolean(storeId),
	});

	const updateMutation = useMutation({
		...trpc.storeAdminLocal.updateMyStore.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: trpc.storeAdminLocal.getMyStore.queryKey(),
			});
		},
	});

	const getLogoUploadUrlMutation = useMutation({
		...trpc.storeAdminLocal.getLogoUploadUrl.mutationOptions(),
	});

	const getBannerUploadUrlMutation = useMutation({
		...trpc.storeAdminLocal.getBannerUploadUrl.mutationOptions(),
	});

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
		profileQuery,
		updateMutation,
		getLogoUploadUrlMutation,
		getBannerUploadUrlMutation,
		promotionsQuery,
		createPromotionMutation,
	};
}
