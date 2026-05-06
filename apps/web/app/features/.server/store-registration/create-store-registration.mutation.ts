import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyStoreRegistrationRequest } from '@/features/.server/admin-platform/store-registration/store-registration-notification.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const createStoreRegistrationInputSchema = z.object({
	mallId: z.string().trim().min(1),
	storeName: z.string().trim().min(2),
	category: z.string().trim().min(2),
	mail: z.email(),
	contactPhone: z.string().trim().min(7).max(20),
	description: z.string().trim().max(2000).optional(),
});

export const createStoreRegistrationMutation = procedures.adminLocal
	.input(createStoreRegistrationInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const mall = await prisma.mall.findUnique({
			where: { id: input.mallId },
			select: {
				id: true,
				name: true,
				status: true,
				adminCcUser: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_store_registrations_create_mall_not_found(
					{},
					{ locale },
				),
			});
		}

		if (mall.status !== 'ACTIVE') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_store_registrations_create_mall_inactive(
					{},
					{ locale },
				),
			});
		}

		const existingRequest = await prisma.storeRegistrationRequest.findFirst({
			where: {
				mallId: input.mallId,
				applicantUserId: ctx.user.id,
				status: 'PENDING',
			},
			select: { id: true },
		});

		if (existingRequest) {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_store_registrations_create_duplicate({}, { locale }),
			});
		}

		const request = await prisma.storeRegistrationRequest.create({
			data: {
				mallId: input.mallId,
				applicantUserId: ctx.user.id,
				storeName: input.storeName,
				category: input.category,
				description: input.description?.trim() || null,
				contactEmail: input.mail,
				contactPhone: input.contactPhone,
				status: 'PENDING',
			},
			select: {
				id: true,
				storeName: true,
				category: true,
				status: true,
				createdAt: true,
			},
		});

		notifyStoreRegistrationRequest({
			registrationRequestId: request.id,
			storeName: request.storeName,
			mallName: mall.name,
			applicantUser: {
				name: ctx.user.name,
				email: ctx.user.email,
			},
			adminCcUser: mall.adminCcUser
				? {
						name: mall.adminCcUser.name,
						email: mall.adminCcUser.email,
					}
				: null,
		});

		return { registrationRequest: request };
	});
