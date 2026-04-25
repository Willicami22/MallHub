import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyStoreRegistrationDecision } from '@/features/.server/admin-platform/store-registration/store-registration-notification.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const approveStoreRegistrationInputSchema = z.object({
	registrationRequestId: z.string().trim().min(1),
});

export const approveStoreRegistrationMutation = procedures.adminPlatform
	.input(approveStoreRegistrationInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const approvedAt = new Date();
		const result = await prisma.$transaction(async (tx) => {
			const request = await tx.storeRegistrationRequest.findUnique({
				where: {
					id: input.registrationRequestId,
				},
				select: {
					id: true,
					mallId: true,
					applicantUserId: true,
					storeName: true,
					category: true,
					description: true,
					contactEmail: true,
					contactPhone: true,
					status: true,
					createdStoreId: true,
					applicant: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					mall: {
						select: {
							id: true,
							name: true,
							adminCcUser: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
				},
			});

			if (!request) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: m.admin_store_registrations_not_found({}, { locale }),
				});
			}

			if (request.status !== 'PENDING') {
				throw new TRPCError({
					code: 'CONFLICT',
					message: m.admin_store_registrations_not_pending({}, { locale }),
				});
			}

			const store = request.createdStoreId
				? await tx.store.update({
						where: {
							id: request.createdStoreId,
						},
						data: {
							mallId: request.mallId,
							ownerUserId: request.applicantUserId,
							name: request.storeName,
							category: request.category,
							description: request.description,
							contactEmail: request.contactEmail,
							phone: request.contactPhone,
							status: 'ACTIVE',
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
								},
							},
							owner: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					})
				: await tx.store.create({
						data: {
							mallId: request.mallId,
							ownerUserId: request.applicantUserId,
							name: request.storeName,
							category: request.category,
							description: request.description,
							contactEmail: request.contactEmail,
							phone: request.contactPhone,
							status: 'ACTIVE',
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
								},
							},
							owner: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					});

			const reviewedRequest = await tx.storeRegistrationRequest.update({
				where: {
					id: request.id,
				},
				data: {
					status: 'APPROVED',
					reviewNotes: null,
					reviewedByUserId: ctx.user.id,
					reviewedAt: approvedAt,
					createdStoreId: store.id,
				},
				select: {
					id: true,
					status: true,
					reviewNotes: true,
					reviewedAt: true,
					createdStoreId: true,
				},
			});

			return {
				request,
				reviewedRequest,
				store,
			};
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminStoreRegistrations.approve',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_STORE_REGISTRATION_APPROVED,
			targetType: 'StoreRegistrationRequest',
			targetId: result.request.id,
			metadata: {
				mallId: result.request.mallId,
				storeId: result.store.id,
				previousStatus: result.request.status,
				nextStatus: result.reviewedRequest.status,
			},
		});

		notifyStoreRegistrationDecision({
			registrationRequestId: result.request.id,
			storeName: result.request.storeName,
			mallName: result.request.mall.name,
			decision: 'APPROVED',
			applicantUser: {
				email: result.request.applicant.email,
				name: result.request.applicant.name,
			},
			adminCcUser: result.request.mall.adminCcUser
				? {
						email: result.request.mall.adminCcUser.email,
						name: result.request.mall.adminCcUser.name,
					}
				: null,
			changedByName: ctx.user.name,
		});

		return {
			registrationRequest: result.reviewedRequest,
			store: {
				...result.store,
				activePlan: null,
			},
		};
	});
