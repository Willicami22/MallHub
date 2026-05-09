import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const productVariantInputSchema = z.object({
	id: z.string().trim().min(1).optional(),
	sku: z.string().trim().min(1),
	label: z.string().trim().min(1),
	priceCents: z.number().int().min(0),
	stock: z.number().int().min(0),
});

const upsertProductInputSchema = z.object({
	id: z.string().trim().min(1).optional(),
	storeId: z.string().trim().min(1),
	name: z.string().trim().min(2),
	category: z.string().trim().nullable(),
	description: z.string().trim().nullable(),
	basePriceCents: z.number().int().min(0),
	priceDiscountCents: z.number().int().min(0).nullable(),
	status: z.enum(['draft', 'active', 'inactive', 'archived']),
	isReservable: z.boolean(),
	images: z.array(z.string().trim().url()).min(1),
	isPublished: z.boolean(),
	variants: z.array(productVariantInputSchema),
});

const mapProductStatus = (
	status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
) => {
	if (status === 'ACTIVE') return 'active' as const;
	if (status === 'INACTIVE') return 'inactive' as const;
	if (status === 'ARCHIVED') return 'archived' as const;
	return 'draft' as const;
};

const mapProduct = (
	product: {
		id: string;
		name: string;
		category: string | null;
		description: string | null;
		priceOriginal: { toNumber: () => number } | number;
		priceDiscount: { toNumber: () => number } | null;
		status: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'ARCHIVED';
		isReservable: boolean;
		variantsJson: string | null;
		imagesJson: string | null;
		createdAt: Date;
		updatedAt: Date;
	},
	storeId: string,
) => ({
	id: product.id,
	storeId,
	name: product.name,
	category: product.category,
	description: product.description ?? null,
	basePriceCents: Math.round(Number(product.priceOriginal)),
	priceDiscountCents: product.priceDiscount
		? Math.round(Number(product.priceDiscount))
		: null,
	status: mapProductStatus(product.status),
	isReservable: product.isReservable,
	variants: product.variantsJson ? JSON.parse(product.variantsJson) : [],
	images: product.imagesJson ? JSON.parse(product.imagesJson) : [],
	createdAt: product.createdAt.toISOString(),
	updatedAt: product.updatedAt.toISOString(),
});

export const upsertProductMutation = procedures.adminLocal
	.input(upsertProductInputSchema)
	.mutation(async ({ input, ctx }) => {
		const store = await prisma.store.findUnique({
			where: { id: input.storeId },
			select: { id: true, ownerUserId: true, mallId: true },
		});

		if (!store || store.ownerUserId !== ctx.user.id) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Tienda no encontrada o acceso denegado.',
			});
		}

		const variantsJson = JSON.stringify(
			input.variants.map((variant) => ({
				id: variant.id ?? crypto.randomUUID(),
				productId: input.id ?? crypto.randomUUID(),
				sku: variant.sku,
				label: variant.label,
				priceCents: variant.priceCents,
				stock: variant.stock,
			})),
		);

		const imagesJson = JSON.stringify(input.images);

		const stock = input.variants.reduce(
			(total, variant) => total + variant.stock,
			0,
		);
		const priceOriginal = input.basePriceCents;
		const priceDiscount = input.priceDiscountCents;
		const _isPublished = input.status === 'active';

		if (input.id) {
			const existing = await prisma.product.findUnique({
				where: { id: input.id },
				select: { id: true, storeId: true },
			});

			if (!existing || existing.storeId !== input.storeId) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Producto no encontrado.',
				});
			}

			const updated = await prisma.product.update({
				where: { id: input.id },
				data: {
					mallId: store.mallId,
					storeId: input.storeId,
					name: input.name,
					category: input.category,
					description: input.description,
					status: input.status.toUpperCase() as
						| 'DRAFT'
						| 'ACTIVE'
						| 'INACTIVE'
						| 'ARCHIVED',
					priceOriginal,
					priceDiscount,
					stock,
					isReservable: input.isReservable,
					variantsJson,
					imagesJson,
				},
			});

			return { product: mapProduct(updated, input.storeId) };
		}

		const created = await prisma.product.create({
			data: {
				mallId: store.mallId,
				storeId: input.storeId,
				name: input.name,
				category: input.category,
				description: input.description,
				status: input.status.toUpperCase() as
					| 'DRAFT'
					| 'ACTIVE'
					| 'INACTIVE'
					| 'ARCHIVED',
				priceOriginal,
				priceDiscount,
				stock,
				isReservable: input.isReservable,
				variantsJson,
				imagesJson,
			},
		});

		return { product: mapProduct(created, input.storeId) };
	});
