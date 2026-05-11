import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const getStoreInputSchema = z.object({
	storeId: z.string().trim().min(1),
});

export const getStoreQuery = procedures.adminPlatform
	.input(getStoreInputSchema)
	.query(async ({ input }) => {
		const locale = getLocaleFromAsyncStorage();
		const store = await prisma.store.findUnique({
			where: {
				id: input.storeId,
			},
			select: {
				id: true,
				name: true,
				category: true,
				description: true,
				phone: true,
				contactEmail: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				mall: {
					select: {
						id: true,
						name: true,
						city: true,
						status: true,
						adminCcUser: {
							select: {
								id: true,
								name: true,
								email: true,
								banned: true,
							},
						},
					},
				},
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
						banned: true,
						role: true,
					},
				},
				billingSubscription: {
					select: {
						id: true,
						planCode: true,
						status: true,
						nextPaymentDueAt: true,
					},
				},
			},
		});

		if (!store) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_stores_not_found({}, { locale }),
			});
		}

		return {
			store: {
				...store,
				activePlan: store.billingSubscription
					? {
							id: store.billingSubscription.id,
							planCode: store.billingSubscription.planCode,
							status: store.billingSubscription.status,
							nextPaymentDueAt: store.billingSubscription.nextPaymentDueAt,
						}
					: null,
			},
		};
	});
