import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	getMallActivationReadiness,
	type MallActivationRequirementCode,
} from '@/features/.server/admin-platform/malls/mall-activation-readiness.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const getMallInputSchema = z.object({
	mallId: z.string().trim().min(1),
});

const getActivationRequirementLabel = (
	requirement: MallActivationRequirementCode,
): string => {
	const locale = getLocaleFromAsyncStorage();
	if (requirement === 'NAME') {
		return m.admin_malls_activation_requirement_name({}, { locale });
	}

	if (requirement === 'CITY') {
		return m.admin_malls_activation_requirement_city({}, { locale });
	}

	if (requirement === 'ADDRESS') {
		return m.admin_malls_activation_requirement_address({}, { locale });
	}

	return m.admin_malls_activation_requirement_admin_cc({}, { locale });
};

export const getMallQuery = procedures.adminPlatform
	.input(getMallInputSchema)
	.query(async ({ input }) => {
		const locale = getLocaleFromAsyncStorage();
		const mall = await prisma.mall.findUnique({
			where: {
				id: input.mallId,
			},
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				description: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				adminCcUserId: true,
				adminCcUser: {
					select: {
						id: true,
						name: true,
						email: true,
						banned: true,
					},
				},
			},
		});

		if (!mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_malls_not_found({}, { locale }),
			});
		}

		const [activeStoreCount, totalStoreCount, pendingStoreRegistrationCount] =
			await Promise.all([
				prisma.store.count({
					where: {
						mallId: mall.id,
						status: 'ACTIVE',
					},
				}),
				prisma.store.count({
					where: {
						mallId: mall.id,
					},
				}),
				prisma.storeRegistrationRequest.count({
					where: {
						mallId: mall.id,
						status: 'PENDING',
					},
				}),
			]);

		const readiness = getMallActivationReadiness({
			name: mall.name,
			city: mall.city,
			address: mall.address,
			adminCcUserId: mall.adminCcUserId,
		});

		return {
			mall: {
				...mall,
				activeStoreCount,
				totalStoreCount,
				pendingStoreRegistrationCount,
				activationReadiness: {
					isReady: readiness.isReady,
					missingRequirements: readiness.missingRequirements.map((code) => ({
						code,
						label: getActivationRequirementLabel(code),
					})),
				},
			},
		};
	});
