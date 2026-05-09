import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const openHourSchema = z.object({
	day: z.string(),
	open: z.string(),
	close: z.string(),
	closed: z.boolean(),
});

const socialLinkSchema = z.object({
	platform: z.string(),
	url: z.string().url('URL inválida').or(z.literal('')),
});

const updateMyStoreInput = z.object({
	name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
	category: z
		.string()
		.trim()
		.min(2, 'La categoría debe tener al menos 2 caracteres.')
		.optional(),
	floor: z.string().trim().min(1, 'El piso es obligatorio.').optional(),
	localNumber: z
		.string()
		.trim()
		.min(1, 'El número de local es obligatorio.')
		.optional(),
	openHours: z.array(openHourSchema).optional(),
	socialLinks: z.array(socialLinkSchema).optional(),
	logoImageUrl: z
		.string()
		.trim()
		.min(1, 'El logo es obligatorio.')
		.url('Ingresa una URL válida para el logo.')
		.optional(),
	bannerImageUrl: z
		.string()
		.trim()
		.url('Ingresa una URL válida para el banner.')
		.optional()
		.or(z.literal('')),
	phone: z.string().trim().optional(),
	contactEmail: z
		.union([z.string().email('Correo electrónico inválido.'), z.literal('')])
		.optional(),
	description: z
		.string()
		.max(2000, 'La descripción no puede superar 2000 caracteres.')
		.optional(),
});

export const updateMyStoreMutation = procedures.adminLocal
	.input(updateMyStoreInput)
	.mutation(async ({ ctx, input }) => {
		const store = await prisma.store.findFirst({
			where: { ownerUserId: ctx.user.id },
		});

		if (!store) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Tienda no encontrada.',
			});
		}

		if (store.status === 'SUSPENDED') {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'No puedes modificar una tienda suspendida.',
			});
		}

		const updated = await prisma.store.update({
			where: { id: store.id },
			data: {
				name: input.name,
				...(input.category !== undefined && { category: input.category }),
				...(input.floor !== undefined && { floor: input.floor }),
				...(input.localNumber !== undefined && {
					localNumber: input.localNumber,
				}),
				...(input.openHours !== undefined && {
					openHoursJson: input.openHours,
				}),
				...(input.socialLinks !== undefined && {
					socialLinksJson: input.socialLinks,
				}),
				...(input.logoImageUrl !== undefined && {
					logoImageUrl: input.logoImageUrl,
				}),
				...(input.bannerImageUrl !== undefined && {
					bannerImageUrl: input.bannerImageUrl || null,
				}),
				...(input.phone !== undefined && { phone: input.phone || null }),
				...(input.contactEmail !== undefined && {
					contactEmail: input.contactEmail || null,
				}),
				...(input.description !== undefined && {
					description: input.description || null,
				}),
			},
			select: { id: true, status: true },
		});

		return { store: updated };
	});
