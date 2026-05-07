import { resolveMallIdForAdminCc } from '@/features/.server/admin-cc/resolve-mall-id.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getPendingCountQuery = procedures.adminCc.query(
	async ({ ctx }) => {
		const mallId = await resolveMallIdForAdminCc(ctx.user);
		if (!mallId) {
			return { count: 0 };
		}

		const count = await prisma.storeRegistrationRequest.count({
			where: { mallId, status: 'PENDING' },
		});

		return { count };
	},
);
