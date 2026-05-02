import { create } from 'zustand';

type ProductsUiState = {
	search: string;
	editorProductId: string | null;
	setSearch: (value: string) => void;
	openEditor: (productId: string | null) => void;
};

/** Estado de UI del catálogo (filtros / editor), sin datos de servidor. */
export const useProductsUiStore = create<ProductsUiState>((set) => ({
	search: '',
	editorProductId: null,
	setSearch: (value) => set({ search: value }),
	openEditor: (productId) => set({ editorProductId: productId }),
}));
