import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getPublicStoreQuery = procedures.public
	.input(z.object({ storeId: z.string().trim().min(1) }))
	.query(async ({ input }) => {
		const store = await prisma.store.findFirst({
			where: {
				id: input.storeId,
				status: 'ACTIVE',
				mall: { status: 'ACTIVE' },
			},
			select: {
				id: true,
				name: true,
				category: true,
				description: true,
				logoImageUrl: true,
				floor: true,
				openHoursJson: true,
				phone: true,
				contactEmail: true,
				mall: {
					select: {
						id: true,
						name: true,
						city: true,
					},
				},
			},
		});

		if (!store) {
			throw new TRPCError({ code: 'NOT_FOUND' });
		}

		return { store };
	});
