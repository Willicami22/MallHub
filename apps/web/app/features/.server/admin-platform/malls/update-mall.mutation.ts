import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ensureMallAdminCcUserIsAssignable } from '@/features/.server/admin-platform/malls/mall-admin-cc-validation.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const updateMallInputSchema = z.object({
	mallId: z.string().trim().min(1),
	name: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_malls_validation_name_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	city: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_malls_validation_city_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(120),
	address: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_malls_validation_address_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(300),
	description: z.string().trim().max(1000).nullable().optional(),
	adminCcUserId: z.string().trim().min(1).nullable().optional(),
});

export const updateMallMutation = procedures.adminPlatform
	.input(updateMallInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const existingMall = await prisma.mall.findUnique({
			where: { id: input.mallId },
			select: {
				id: true,
				name: true,
				city: true,
				address: true,
				description: true,
				status: true,
				adminCcUserId: true,
			},
		});

		if (!existingMall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_malls_not_found({}, { locale }),
			});
		}

		const requestedAdminCcUserId =
			input.adminCcUserId === undefined
				? undefined
				: input.adminCcUserId?.trim();
		const nextAdminCcUserId =
			requestedAdminCcUserId === undefined
				? existingMall.adminCcUserId
				: requestedAdminCcUserId || null;
		const normalizedDescription = input.description?.trim() || null;

		if (existingMall.status === 'ACTIVE' && nextAdminCcUserId === null) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_malls_active_unassign_forbidden({}, { locale }),
			});
		}

		if (nextAdminCcUserId) {
			await ensureMallAdminCcUserIsAssignable(nextAdminCcUserId);
		}

		try {
			const mall = await prisma.$transaction(async (tx) => {
				if (
					nextAdminCcUserId &&
					nextAdminCcUserId !== existingMall.adminCcUserId
				) {
					const existingAssignment = await tx.adminCcAssignment.findFirst({
						where: {
							mallId: existingMall.id,
							adminCcUserId: nextAdminCcUserId,
						},
						select: {
							id: true,
						},
					});

					if (!existingAssignment) {
						await tx.adminCcAssignment.create({
							data: {
								mallId: existingMall.id,
								adminCcUserId: nextAdminCcUserId,
								createdByUserId: ctx.user.id,
							},
						});
					}
				}

				return tx.mall.update({
					where: {
						id: existingMall.id,
					},
					data: {
						name: input.name.trim(),
						city: input.city.trim(),
						address: input.address.trim(),
						description: normalizedDescription,
						adminCcUserId: nextAdminCcUserId,
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
			});

			await writeAuditEventBestEffort({
				context: 'trpc.adminMalls.update',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_MALL_UPDATED,
				targetType: 'Mall',
				targetId: mall.id,
				metadata: {
					previous: {
						name: existingMall.name,
						city: existingMall.city,
						address: existingMall.address,
						description: existingMall.description,
						adminCcUserId: existingMall.adminCcUserId,
					},
					next: {
						name: mall.name,
						city: mall.city,
						address: mall.address,
						description: mall.description,
						adminCcUserId: mall.adminCcUserId,
					},
				},
			});

			return { mall };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			console.error('[trpc.adminMalls.update] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_malls_update_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
