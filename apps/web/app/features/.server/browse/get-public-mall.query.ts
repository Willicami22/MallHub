import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getPublicMallQuery = procedures.public
	.input(z.object({ mallId: z.string().trim().min(1) }))
	.query(async ({ input }) => {
		const mall = await prisma.mall.findFirst({
			where: { id: input.mallId, status: 'ACTIVE' },
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				description: true,
				phone: true,
				logoImageUrl: true,
				heroImageUrl: true,
				openHoursJson: true,
				socialLinksJson: true,
				galleryImages: {
					orderBy: { sortOrder: 'asc' },
					take: 10,
					select: { id: true, imageUrl: true, label: true },
				},
				_count: {
					select: {
						stores: { where: { status: 'ACTIVE' } },
					},
				},
			},
		});

		if (!mall) {
			throw new TRPCError({ code: 'NOT_FOUND' });
		}

		return {
			mall: {
				id: mall.id,
				name: mall.name,
				city: mall.city,
				address: mall.address,
				description: mall.description,
				phone: mall.phone,
				logoImageUrl: mall.logoImageUrl,
				heroImageUrl: mall.heroImageUrl,
				openHoursJson: mall.openHoursJson,
				socialLinksJson: mall.socialLinksJson,
				galleryImages: mall.galleryImages,
				activeStoreCount: mall._count.stores,
			},
		};
	});
