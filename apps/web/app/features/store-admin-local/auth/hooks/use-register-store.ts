import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/store-admin-local/auth/services/auth.service';
import { useStoreAdminContextStore } from '@/features/store-admin-local/auth/store/store-admin-context.store';
import type { RegisterStorePayload } from '@/features/store-admin-local/auth/types';

export function useRegisterStore() {
	const setActiveStoreId = useStoreAdminContextStore(
		(state) => state.setActiveStoreId,
	);

	return useMutation({
		mutationFn: (payload: RegisterStorePayload) =>
			authService.registerMerchantStore(payload),
		onSuccess: (result) => {
			setActiveStoreId(result.store.id);
		},
	});
}
