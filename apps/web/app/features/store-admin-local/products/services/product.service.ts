import { inMemoryProductsRepo } from '@/features/store-admin-local/products/services/in-memory-products.repo';
import {
	mockLatency,
	shouldMockFail,
} from '@/features/store-admin-local/shared/lib/mock-api.lib';
import type {
	Product,
	ProductVariant,
} from '@/features/store-admin-local/shared/types/domain.models';
import { ServiceError } from '@/features/store-admin-local/shared/types/service-error.types';

export type ProductUpsertVariantDto = {
	id?: string;
	sku: string;
	label: string;
	priceCents: number;
	stock: number;
};

export type ProductUpsertDto = {
	id?: string;
	storeId: string;
	name: string;
	category: string | null;
	description: string | null;
	basePriceCents: number;
	priceDiscountCents: number | null;
	status: 'draft' | 'active' | 'inactive' | 'archived';
	isReservable: boolean;
	images: string[];
	isPublished: boolean;
	variants: ProductUpsertVariantDto[];
};

const toVariant = (
	productId: string,
	variant: ProductUpsertVariantDto,
): ProductVariant => ({
	id: variant.id ?? `var_${crypto.randomUUID()}`,
	productId,
	sku: variant.sku,
	label: variant.label,
	priceCents: variant.priceCents,
	stock: variant.stock,
});

export const productService = {
	async listByStore(storeId: string): Promise<Product[]> {
		await mockLatency(280);
		return inMemoryProductsRepo.listByStore(storeId);
	},

	async getById(productId: string): Promise<Product | null> {
		await mockLatency(120);
		return inMemoryProductsRepo.getById(productId) ?? null;
	},

	async upsert(dto: ProductUpsertDto): Promise<Product> {
		await mockLatency(350);
		if (shouldMockFail(`${dto.name}@`)) {
			throw new ServiceError('Error al guardar el producto (simulación).', {
				code: 'UNKNOWN',
			});
		}

		const id = dto.id ?? `prod_${crypto.randomUUID()}`;
		const product: Product = {
			id,
			storeId: dto.storeId,
			name: dto.name,
			category: dto.category,
			description: dto.description,
			priceDiscountCents: dto.priceDiscountCents,
			status: dto.status,
			basePriceCents: dto.basePriceCents,
			isReservable: dto.isReservable,
			isPublished: dto.isPublished,
			images: dto.images,
			variants: dto.variants.map((variant) => toVariant(id, variant)),
			createdAt: dto.id
				? (inMemoryProductsRepo.getById(id)?.createdAt ??
					new Date().toISOString())
				: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		inMemoryProductsRepo.upsert(product);
		return product;
	},

	async delete(productId: string): Promise<void> {
		await mockLatency(200);
		inMemoryProductsRepo.delete(productId);
	},
};
