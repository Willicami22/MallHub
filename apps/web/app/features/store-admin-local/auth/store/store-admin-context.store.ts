import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type StoreAdminContextState = {
	activeStoreId: string | null;
	setActiveStoreId: (storeId: string | null) => void;
};

/**
 * UI / tenancy context for Store Admin (evita prop drilling de storeId).
 * Los datos remotos siguen viviendo en TanStack Query; esto solo selecciona tenant.
 */
export const useStoreAdminContextStore = create<StoreAdminContextState>()(
	persist(
		(set) => ({
			activeStoreId: 'store_seed_1',
			setActiveStoreId: (storeId) => set({ activeStoreId: storeId }),
		}),
		{ name: 'mallhub-store-admin-context' },
	),
);
