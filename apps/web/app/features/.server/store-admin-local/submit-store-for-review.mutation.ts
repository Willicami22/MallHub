import { TRPCError } from '@trpc/server';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const submitStoreForReviewMutation = procedures.adminLocal.mutation(
	async ({ ctx }) => {
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
				message: 'No puedes enviar una tienda suspendida a revisión.',
			});
		}

		if (store.status === 'PENDING_APPROVAL') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'La tienda ya está pendiente de revisión.',
			});
		}

		const missingFields =
			!store.name ||
			!store.category ||
			!store.floor ||
			!store.localNumber ||
			!store.openHoursJson ||
			!store.logoImageUrl;

		if (missingFields) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message:
					'Completa y guarda todos los campos obligatorios antes de enviar a revisión.',
			});
		}

		await prisma.store.update({
			where: { id: store.id },
			data: { status: 'PENDING_APPROVAL' },
		});

		return { ok: true };
	},
);
