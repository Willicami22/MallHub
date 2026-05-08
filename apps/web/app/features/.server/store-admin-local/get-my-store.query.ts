import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getMyStoreQuery = procedures.adminLocal.query(async ({ ctx }) => {
	const store = await prisma.store.findFirst({
		where: { ownerUserId: ctx.user.id },
		select: {
			id: true,
			name: true,
			category: true,
			floor: true,
			localNumber: true,
			openHoursJson: true,
			logoImageUrl: true,
			phone: true,
			contactEmail: true,
			description: true,
			status: true,
			mallId: true,
			mall: { select: { id: true, name: true, city: true } },
		},
	});

	return { store };
});
