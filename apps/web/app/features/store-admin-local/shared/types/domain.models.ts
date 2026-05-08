/** Canonical domain models for MallHub Store Admin (local). Replace with Supabase row types when wiring RPC. */

export type StoreStatus = 'draft' | 'active' | 'suspended';

export type Store = {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	status: StoreStatus;
	createdAt: string;
	updatedAt: string;
};

export type ProductVariant = {
	id: string;
	productId: string;
	sku: string;
	label: string;
	priceCents: number;
	stock: number;
};

export type Product = {
	id: string;
	storeId: string;
	name: string;
	description: string | null;
	basePriceCents: number;
	isPublished: boolean;
	variants: ProductVariant[];
	createdAt: string;
	updatedAt: string;
};

export type ReservationStatus =
	| 'pending'
	| 'confirmed'
	| 'rejected'
	| 'completed';

export type Reservation = {
	id: string;
	storeId: string;
	customerName: string;
	customerEmail: string;
	startsAt: string;
	endsAt: string;
	status: ReservationStatus;
	notes: string | null;
	createdAt: string;
};

export type PromotionStatus = 'scheduled' | 'active' | 'expired' | 'cancelled';

export type Promotion = {
	id: string;
	storeId: string;
	title: string;
	discountPercent: number;
	startsAt: string;
	endsAt: string;
	status: PromotionStatus;
	createdAt: string;
};
