import { resolveMallIdForAdminCc } from '@/features/.server/admin-cc/resolve-mall-id.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

export const getMallStoresQuery = procedures.adminCc.query(async ({ ctx }) => {
	const mallId = await resolveMallIdForAdminCc(ctx.user);
	if (!mallId) {
		return {
			pendingRegistrations: [],
			activeStores: [],
			suspendedStores: [],
		};
	}

	const [pendingRegistrations, activeStores, suspendedStores] =
		await Promise.all([
			prisma.storeRegistrationRequest.findMany({
				where: { mallId, status: 'PENDING' },
				select: {
					id: true,
					storeName: true,
					category: true,
					description: true,
					contactEmail: true,
					contactPhone: true,
					createdAt: true,
					applicant: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: 'asc' },
			}),
			prisma.store.findMany({
				where: { mallId, status: 'ACTIVE' },
				select: {
					id: true,
					name: true,
					category: true,
					description: true,
					floor: true,
					phone: true,
					contactEmail: true,
					status: true,
					createdAt: true,
					owner: { select: { id: true, name: true, email: true } },
					_count: {
						select: {
							reservations: {
								where: { status: { in: ['PENDING', 'CONFIRMED'] } },
							},
						},
					},
				},
				orderBy: { name: 'asc' },
			}),
			prisma.store.findMany({
				where: { mallId, status: 'SUSPENDED' },
				select: {
					id: true,
					name: true,
					category: true,
					description: true,
					floor: true,
					phone: true,
					contactEmail: true,
					status: true,
					createdAt: true,
					owner: { select: { id: true, name: true, email: true } },
					_count: {
						select: {
							reservations: {
								where: { status: { in: ['PENDING', 'CONFIRMED'] } },
							},
						},
					},
				},
				orderBy: { name: 'asc' },
			}),
		]);

	return {
		pendingRegistrations,
		activeStores,
		suspendedStores,
	};
});
