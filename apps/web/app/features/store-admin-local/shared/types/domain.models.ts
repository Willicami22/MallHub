/** Canonical domain models for MallHub Store Admin (local). Replace with Supabase row types when wiring RPC. */

export type StoreStatus = 'draft' | 'active' | 'suspended';

export type Store = {
	id: string;
	name: string;
	description: string | null;
	logoImageUrl: string | null;
	bannerImageUrl: string | null;
	openHoursJson: any | null;
	socialLinksJson: any | null;
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

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type Product = {
	id: string;
	storeId: string;
	name: string;
	category: string | null;
	description: string | null;
	priceDiscountCents: number | null;
	status: ProductStatus;
	basePriceCents: number;
	isReservable: boolean;
	isPublished: boolean;
	images: string[];
	variants: ProductVariant[];
	createdAt: string;
	updatedAt: string;
};

export type ReservationStatus =
	| 'pending'
	| 'confirmed'
	| 'rejected'
	| 'completed'
	| 'canceled';

export type Reservation = {
	id: string;
	storeId: string;
	productId: string;
	productName: string;
	quantity: number;
	customerName: string;
	customerEmail: string;
	pickupPhone: string;
	startsAt: string;
	endsAt: string;
	status: ReservationStatus;
	notes: string | null;
	requestedAt: string;
	confirmedAt: string | null;
	completedAt: string | null;
	canceledAt: string | null;
	statusReason: string | null;
	createdAt: string;
};

export type PromotionStatus = 'draft' | 'active' | 'inactive' | 'expired';

export type Promotion = {
	id: string;
	storeId: string;
	title: string;
	description: string | null;
	discountPercent: number;
	startsAt: string | null;
	endsAt: string | null;
	status: PromotionStatus;
	viewsCount: number;
	clicksCount: number;
	createdAt: string;
};
