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

const updateMyStoreInput = z.object({
	name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
	category: z
		.string()
		.trim()
		.min(2, 'La categoría debe tener al menos 2 caracteres.'),
	floor: z.string().trim().min(1, 'El piso es obligatorio.'),
	localNumber: z.string().trim().min(1, 'El número de local es obligatorio.'),
	openHours: z.array(openHourSchema).min(1, 'Los horarios son obligatorios.'),
	logoImageUrl: z
		.string()
		.trim()
		.min(1, 'El logo es obligatorio.')
		.url('Ingresa una URL válida para el logo.'),
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
				category: input.category,
				floor: input.floor,
				localNumber: input.localNumber,
				openHoursJson: input.openHours,
				logoImageUrl: input.logoImageUrl,
				phone: input.phone ?? null,
				contactEmail: input.contactEmail || null,
				description: input.description ?? null,
			},
			select: { id: true, status: true },
		});

		return { store: updated };
	});
