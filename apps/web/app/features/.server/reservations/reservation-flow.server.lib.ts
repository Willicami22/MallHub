import { randomUUID } from 'node:crypto';
import { ProductStatus } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import {
	buildVariantSnapshot,
	isVariantSelectionValid,
	parseVariantGroups,
	type SelectedVariant,
} from '@/features/reservations/lib/reservation-flow.lib';

export type ReservationFlowProduct = {
	id: string;
	name: string;
	priceOriginal: number;
	priceDiscount: number | null;
	stock: number;
	isReservable: boolean;
	variantsJson: string | null;
	store: {
		id: string;
		name: string;
		floor: string | null;
		openHours: string | null;
		mall: {
			id: string;
			name: string;
		};
	};
};

export type ReservationCreationFailureCode =
	| 'PRODUCT_NOT_FOUND'
	| 'PRODUCT_NOT_RESERVABLE'
	| 'PRODUCT_OUT_OF_STOCK'
	| 'INVALID_VARIANTS';

export class ReservationCreationError extends Error {
	constructor(public readonly code: ReservationCreationFailureCode) {
		super(code);
	}
}

const SELECTABLE_PRODUCT_SHAPE = {
	id: true,
	name: true,
	priceOriginal: true,
	priceDiscount: true,
	stock: true,
	isReservable: true,
	variantsJson: true,
	store: {
		select: {
			id: true,
			name: true,
			floor: true,
			openHours: true,
			mall: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
} as const;

export async function findReservableProduct(
	productId: string,
): Promise<ReservationFlowProduct | null> {
	const product = await prisma.product.findFirst({
		where: {
			id: productId,
			status: ProductStatus.ACTIVE,
			store: { status: 'ACTIVE', mall: { status: 'ACTIVE' } },
		},
		select: SELECTABLE_PRODUCT_SHAPE,
	});

	if (!product) {
		return null;
	}

	return {
		...product,
		priceOriginal: product.priceOriginal.toNumber(),
		priceDiscount: product.priceDiscount?.toNumber() ?? null,
	};
}

export async function createReservationFromFlow({
	productId,
	customerUserId,
	quantity,
	pickupFullName,
	pickupPhone,
	pickupNote,
	scheduledAt,
	selectedVariants,
}: {
	productId: string;
	customerUserId: string;
	quantity: number;
	pickupFullName: string;
	pickupPhone: string;
	pickupNote?: string | null;
	scheduledAt?: Date | null;
	selectedVariants: SelectedVariant[];
}): Promise<{ reservationId: string; qrCodeValue: string }> {
	const product = await prisma.product.findFirst({
		where: {
			id: productId,
			status: ProductStatus.ACTIVE,
			store: { status: 'ACTIVE', mall: { status: 'ACTIVE' } },
		},
		select: {
			id: true,
			mallId: true,
			storeId: true,
			isReservable: true,
			variantsJson: true,
		},
	});

	if (!product) {
		throw new ReservationCreationError('PRODUCT_NOT_FOUND');
	}

	if (!product.isReservable) {
		throw new ReservationCreationError('PRODUCT_NOT_RESERVABLE');
	}

	const variantGroups = parseVariantGroups(product.variantsJson);
	if (!isVariantSelectionValid(variantGroups, selectedVariants)) {
		throw new ReservationCreationError('INVALID_VARIANTS');
	}

	const variantSnapshot = buildVariantSnapshot(selectedVariants);
	const normalizedNote = pickupNote?.trim() ?? '';
	const mergedPickupNote = (() => {
		if (normalizedNote.length > 0 && variantSnapshot) {
			return `${normalizedNote}\n\n${variantSnapshot}`;
		}

		if (normalizedNote.length > 0) {
			return normalizedNote;
		}

		return variantSnapshot;
	})();
	const qrCodeValue = `mh-res-${randomUUID()}`;

	const reservation = await prisma.$transaction(async (tx) => {
		const updatedStock = await tx.product.updateMany({
			where: {
				id: productId,
				status: ProductStatus.ACTIVE,
				isReservable: true,
				stock: {
					gte: quantity,
				},
				store: {
					status: 'ACTIVE',
					mall: { status: 'ACTIVE' },
				},
			},
			data: {
				stock: {
					decrement: quantity,
				},
			},
		});

		if (updatedStock.count === 0) {
			throw new ReservationCreationError('PRODUCT_OUT_OF_STOCK');
		}

		return tx.reservation.create({
			data: {
				mallId: product.mallId,
				storeId: product.storeId,
				productId: product.id,
				customerUserId,
				quantity,
				pickupFullName: pickupFullName.trim(),
				pickupPhone: pickupPhone.trim(),
				pickupNote: mergedPickupNote,
				qrCodeValue,
				scheduledAt: scheduledAt ?? null,
			},
			select: {
				id: true,
			},
		});
	});

	return {
		reservationId: reservation.id,
		qrCodeValue,
	};
}
