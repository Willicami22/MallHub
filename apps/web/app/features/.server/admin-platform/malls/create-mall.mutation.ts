import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { addDays } from '@/features/.server/admin-platform/billing/billing-plan-catalog.lib';
import { ensureMallAdminCcUserIsAssignable } from '@/features/.server/admin-platform/malls/mall-admin-cc-validation.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const createMallInputSchema = z.object({
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

export type CreateMallInput = z.infer<typeof createMallInputSchema>;

export const createMallMutation = procedures.adminPlatform
	.input(createMallInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const normalizedAdminCcUserId = input.adminCcUserId?.trim() || null;
		const normalizedDescription = input.description?.trim() || null;
		const assignableAdminCcUser = normalizedAdminCcUserId
			? await ensureMallAdminCcUserIsAssignable(normalizedAdminCcUserId)
			: null;

		try {
			const mall = await prisma.$transaction(async (tx) => {
				const createdMall = await tx.mall.create({
					data: {
						name: input.name.trim(),
						city: input.city.trim(),
						address: input.address.trim(),
						description: normalizedDescription,
						status: 'INACTIVE',
						adminCcUserId: assignableAdminCcUser?.id ?? null,
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

				const currentPeriodStart = new Date();
				const currentPeriodEnd = addDays(currentPeriodStart, 30);

				await tx.billingSubscription.create({
					data: {
						targetType: 'MALL',
						mallId: createdMall.id,
						planCode: 'BASIC',
						status: 'ACTIVE',
						currentPeriodStart,
						currentPeriodEnd,
						nextPaymentDueAt: currentPeriodEnd,
						createdByUserId: ctx.user.id,
						updatedByUserId: ctx.user.id,
					},
				});

				if (assignableAdminCcUser) {
					await tx.adminCcAssignment.create({
						data: {
							mallId: createdMall.id,
							adminCcUserId: assignableAdminCcUser.id,
							createdByUserId: ctx.user.id,
						},
					});
				}

				return createdMall;
			});

			await writeAuditEventBestEffort({
				context: 'trpc.adminMalls.create',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_MALL_CREATED,
				targetType: 'Mall',
				targetId: mall.id,
				metadata: {
					name: mall.name,
					city: mall.city,
					status: mall.status,
					adminCcUserId: mall.adminCcUserId,
				},
			});

			return { mall };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			console.error('[trpc.adminMalls.create] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_malls_create_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
