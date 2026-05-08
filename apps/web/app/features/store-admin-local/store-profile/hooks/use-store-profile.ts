import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	type PromotionCreateDto,
	type StoreProfileUpdateDto,
	storeProfileService,
} from '@/features/store-admin-local/store-profile/services/store-profile.service';

const profileKey = (storeId: string) =>
	['store-admin', 'store-profile', storeId] as const;
const promosKey = (storeId: string) =>
	['store-admin', 'promotions', storeId] as const;

export function useStoreProfile(storeId: string | null) {
	const queryClient = useQueryClient();

	const profileQuery = useQuery({
		queryKey: profileKey(storeId ?? 'none'),
		queryFn: async () => {
			if (!storeId) {
				return null;
			}
			return storeProfileService.getProfile(storeId);
		},
		enabled: Boolean(storeId),
	});

	const updateMutation = useMutation({
		mutationFn: ({ sId, dto }: { sId: string; dto: StoreProfileUpdateDto }) =>
			storeProfileService.updateProfile(sId, dto),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: profileKey(variables.sId),
			});
		},
	});

	const promotionsQuery = useQuery({
		queryKey: promosKey(storeId ?? 'none'),
		queryFn: async () => {
			if (!storeId) {
				return [];
			}
			return storeProfileService.listPromotions(storeId);
		},
		enabled: Boolean(storeId),
	});

	const createPromotionMutation = useMutation({
		mutationFn: ({ sId, dto }: { sId: string; dto: PromotionCreateDto }) =>
			storeProfileService.createPromotion(sId, dto),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: promosKey(variables.sId),
			});
		},
	});

	return {
		profileQuery,
		updateMutation,
		promotionsQuery,
		createPromotionMutation,
	};
}
