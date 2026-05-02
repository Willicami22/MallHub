import {
	mockLatency,
	shouldMockFail,
} from '@/features/store-admin-local/shared/lib/mock-api.lib';
import type {
	Promotion,
	Store,
} from '@/features/store-admin-local/shared/types/domain.models';
import { ServiceError } from '@/features/store-admin-local/shared/types/service-error.types';

type StoreProfileState = {
	store: Store;
	promotions: Promotion[];
};

const memory = new Map<string, StoreProfileState>();

const seedProfile = (storeId: string): StoreProfileState => {
	const base: Store = {
		id: storeId,
		slug: 'demo-boutique',
		name: 'Boutique Demo',
		description: 'Edición capsule y pickups en tienda.',
		status: 'active',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const promotions: Promotion[] = [
		{
			id: 'promo_1',
			storeId,
			title: '2×1 accesorios',
			discountPercent: 50,
			startsAt: new Date().toISOString(),
			endsAt: new Date(Date.now() + 604_800_000).toISOString(),
			status: 'active',
			createdAt: new Date().toISOString(),
		},
	];

	return { store: base, promotions };
};

const getOrSeed = (storeId: string): StoreProfileState => {
	const existing = memory.get(storeId);
	if (existing) {
		return existing;
	}
	const seeded = seedProfile(storeId);
	memory.set(storeId, seeded);
	return seeded;
};

export type StoreProfileUpdateDto = Pick<
	Store,
	'name' | 'description' | 'slug'
>;

export type PromotionCreateDto = {
	title: string;
	discountPercent: number;
	startsAt: string;
	endsAt: string;
};

export const storeProfileService = {
	async getProfile(storeId: string): Promise<Store> {
		await mockLatency(200);
		return getOrSeed(storeId).store;
	},

	async updateProfile(
		storeId: string,
		dto: StoreProfileUpdateDto,
	): Promise<Store> {
		await mockLatency(320);
		if (shouldMockFail(`${dto.name}`)) {
			throw new ServiceError('No se pudo guardar el perfil (simulación).', {
				code: 'UNKNOWN',
			});
		}
		const state = getOrSeed(storeId);
		const updated: Store = {
			...state.store,
			...dto,
			updatedAt: new Date().toISOString(),
		};
		memory.set(storeId, { ...state, store: updated });
		return updated;
	},

	async listPromotions(storeId: string): Promise<Promotion[]> {
		await mockLatency(240);
		return [...getOrSeed(storeId).promotions].sort(
			(a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
		);
	},

	async createPromotion(
		storeId: string,
		dto: PromotionCreateDto,
	): Promise<Promotion> {
		await mockLatency(280);
		const state = getOrSeed(storeId);
		const promotion: Promotion = {
			id: `promo_${crypto.randomUUID()}`,
			storeId,
			title: dto.title,
			discountPercent: dto.discountPercent,
			startsAt: dto.startsAt,
			endsAt: dto.endsAt,
			status: 'scheduled',
			createdAt: new Date().toISOString(),
		};
		memory.set(storeId, {
			...state,
			promotions: [promotion, ...state.promotions],
		});
		return promotion;
	},
};
