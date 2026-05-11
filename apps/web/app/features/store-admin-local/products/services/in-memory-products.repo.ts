import type { Product } from '@/features/store-admin-local/shared/types/domain.models';

const seed: Product[] = [
	{
		id: 'prod_1',
		storeId: 'store_seed_1',
		name: 'Bolso urbano',
		category: 'Accesorios',
		description: 'Edición limitada',
		priceDiscountCents: 7990,
		status: 'active',
		basePriceCents: 8990,
		isReservable: true,
		isPublished: true,
		images: [
			'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200',
		],
		variants: [
			{
				id: 'var_1',
				productId: 'prod_1',
				sku: 'BAG-BLK',
				label: 'Negro',
				priceCents: 8990,
				stock: 12,
			},
			{
				id: 'var_2',
				productId: 'prod_1',
				sku: 'BAG-TAN',
				label: 'Cognac',
				priceCents: 9290,
				stock: 4,
			},
		],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

let catalog = [...seed];

export const inMemoryProductsRepo = {
	listByStore(storeId: string): Product[] {
		return catalog.filter((product) => product.storeId === storeId);
	},
	getById(productId: string): Product | undefined {
		return catalog.find((product) => product.id === productId);
	},
	upsert(product: Product) {
		const index = catalog.findIndex((row) => row.id === product.id);
		if (index === -1) {
			catalog = [...catalog, product];
			return;
		}
		catalog = [
			...catalog.slice(0, index),
			product,
			...catalog.slice(index + 1),
		];
	},
	delete(productId: string) {
		catalog = catalog.filter((product) => product.id !== productId);
	},
	reset() {
		catalog = [...seed];
	},
};
