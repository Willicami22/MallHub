import { randomUUID } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ProductStatus } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const selectedVariantSchema = z.object({
	type: z.string().trim().min(1),
	option: z.string().trim().min(1),
});

const createReservationInputSchema = z.object({
	productId: z.string().trim().min(1),
	quantity: z.coerce
		.number()
		.int()
		.min(1, {
			error: () =>
				m.reservation_create_validation_quantity_invalid(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(99),
	pickupFullName: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.reservation_create_validation_pickup_name_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		}),
	pickupPhone: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.reservation_create_validation_pickup_phone_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		}),
	pickupNote: z.string().trim().max(500).nullable().optional(),
	selectedVariants: z.array(selectedVariantSchema).max(20).default([]),
});

export type CreateReservationInput = z.infer<
	typeof createReservationInputSchema
>;

const buildVariantSnapshot = (
	selectedVariants: CreateReservationInput['selectedVariants'],
) =>
	selectedVariants.length > 0
		? `#variants:${JSON.stringify(selectedVariants)}`
		: null;

const buildPickupNote = ({
	pickupNote,
	selectedVariants,
}: {
	pickupNote: string | null | undefined;
	selectedVariants: CreateReservationInput['selectedVariants'];
}) => {
	const note = pickupNote?.trim() ?? '';
	const variantSnapshot = buildVariantSnapshot(selectedVariants);

	if (note.length > 0 && variantSnapshot) {
		return `${note}\n\n${variantSnapshot}`;
	}

	if (note.length > 0) {
		return note;
	}

	return variantSnapshot;
};

export const createReservationMutation = procedures.customer
	.input(createReservationInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const product = await prisma.product.findFirst({
			where: {
				id: input.productId,
				status: ProductStatus.ACTIVE,
				store: { status: 'ACTIVE', mall: { status: 'ACTIVE' } },
			},
			select: {
				id: true,
				mallId: true,
				storeId: true,
				isReservable: true,
			},
		});

		if (!product) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.reservation_create_product_not_found({}, { locale }),
			});
		}

		if (!product.isReservable) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.reservation_create_product_not_reservable({}, { locale }),
			});
		}

		try {
			const reservation = await prisma.$transaction(async (tx) => {
				const stockUpdate = await tx.product.updateMany({
					where: {
						id: input.productId,
						status: ProductStatus.ACTIVE,
						isReservable: true,
						stock: {
							gte: input.quantity,
						},
						store: { status: 'ACTIVE', mall: { status: 'ACTIVE' } },
					},
					data: {
						stock: {
							decrement: input.quantity,
						},
					},
				});

				if (stockUpdate.count === 0) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: m.reservation_create_product_out_of_stock({}, { locale }),
					});
				}

				return tx.reservation.create({
					data: {
						mallId: product.mallId,
						storeId: product.storeId,
						productId: product.id,
						customerUserId: ctx.user.id,
						quantity: input.quantity,
						pickupFullName: input.pickupFullName,
						pickupPhone: input.pickupPhone,
						pickupNote: buildPickupNote({
							pickupNote: input.pickupNote,
							selectedVariants: input.selectedVariants,
						}),
						qrCodeValue: `mh-res-${randomUUID()}`,
					},
					select: {
						id: true,
						status: true,
					},
				});
			});

			return { reservation };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			console.error('[trpc.reservations.create] Error', {
				error,
				productId: input.productId,
				customerUserId: ctx.user.id,
			});

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.reservation_create_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
