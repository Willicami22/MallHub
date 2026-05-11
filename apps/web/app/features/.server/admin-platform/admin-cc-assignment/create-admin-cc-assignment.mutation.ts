import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

const createAdminCcAssignmentInputSchema = z.object({
	mallId: z.string().trim().min(1),
	adminCcUserId: z.string().trim().min(1),
});

export const createAdminCcAssignmentMutation = procedures.adminPlatform
	.input(createAdminCcAssignmentInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();

		const [mall, adminCcUser] = await Promise.all([
			prisma.mall.findUnique({
				where: { id: input.mallId },
				select: {
					id: true,
					name: true,
					adminCcUserId: true,
				},
			}),
			prisma.user.findUnique({
				where: { id: input.adminCcUserId },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					banned: true,
				},
			}),
		]);

		if (!mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_cc_assignment_mall_not_found({}, { locale }),
			});
		}

		if (!adminCcUser) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_cc_assignment_user_not_found({}, { locale }),
			});
		}

		if (adminCcUser.role !== appRoles.ADMIN_CC) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_cc_assignment_user_role_invalid({}, { locale }),
			});
		}

		if (adminCcUser.banned) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_cc_assignment_user_banned({}, { locale }),
			});
		}

		if (mall.adminCcUserId === adminCcUser.id) {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_cc_assignment_already_active({}, { locale }),
			});
		}

		try {
			const assignment = await prisma.$transaction(async (tx) => {
				const existingAssignment = await tx.adminCcAssignment.findFirst({
					where: {
						mallId: mall.id,
						adminCcUserId: adminCcUser.id,
					},
					select: {
						id: true,
					},
				});

				if (existingAssignment) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: m.admin_cc_assignment_exists({}, { locale }),
					});
				}

				const createdAssignment = await tx.adminCcAssignment.create({
					data: {
						mallId: mall.id,
						adminCcUserId: adminCcUser.id,
						createdByUserId: ctx.user.id,
					},
					select: {
						id: true,
						createdAt: true,
						mall: {
							select: {
								id: true,
								name: true,
								status: true,
							},
						},
						adminCcUser: {
							select: {
								id: true,
								name: true,
								email: true,
								role: true,
								banned: true,
							},
						},
						createdByUser: {
							select: {
								id: true,
								name: true,
								email: true,
								role: true,
							},
						},
					},
				});

				await tx.mall.update({
					where: { id: mall.id },
					data: { adminCcUserId: adminCcUser.id },
				});

				return createdAssignment;
			});

			await writeAuditEventBestEffort({
				context: 'trpc.adminCcAssignments.create',
				actorUserId: ctx.user.id,
				action: auditEventActions.ADMIN_CC_ASSIGNMENT_CREATED,
				targetType: 'Mall',
				targetId: mall.id,
				metadata: {
					adminCcUserId: adminCcUser.id,
				},
			});

			return { assignment };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			console.error('[trpc.adminCcAssignments.create] Error', { error });

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.admin_cc_assignment_create_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}
	});
