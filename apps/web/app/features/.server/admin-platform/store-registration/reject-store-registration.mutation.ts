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

const rejectStoreRegistrationInputSchema = z.object({
	registrationRequestId: z.string().trim().min(1),
	reason: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_store_registrations_validation_reject_reason_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.max(500),
});

export const rejectStoreRegistrationMutation = procedures.adminPlatform
	.input(rejectStoreRegistrationInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const normalizedReason = input.reason.trim();
		const rejectedAt = new Date();
		const result = await prisma.$transaction(async (tx) => {
			const request = await tx.storeRegistrationRequest.findUnique({
				where: {
					id: input.registrationRequestId,
				},
				select: {
					id: true,
					mallId: true,
					storeName: true,
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
							status: 'REJECTED',
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
							billingSubscription: {
								select: {
									id: true,
									planCode: true,
									status: true,
									nextPaymentDueAt: true,
								},
							},
						},
					})
				: null;

			const reviewedRequest = await tx.storeRegistrationRequest.update({
				where: {
					id: request.id,
				},
				data: {
					status: 'REJECTED',
					reviewNotes: normalizedReason,
					reviewedByUserId: ctx.user.id,
					reviewedAt: rejectedAt,
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
			context: 'trpc.adminStoreRegistrations.reject',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_STORE_REGISTRATION_REJECTED,
			targetType: 'StoreRegistrationRequest',
			targetId: result.request.id,
			metadata: {
				mallId: result.request.mallId,
				storeId: result.store?.id ?? result.request.createdStoreId ?? null,
				previousStatus: result.request.status,
				nextStatus: result.reviewedRequest.status,
				reason: normalizedReason,
			},
		});

		notifyStoreRegistrationDecision({
			registrationRequestId: result.request.id,
			storeName: result.request.storeName,
			mallName: result.request.mall.name,
			decision: 'REJECTED',
			reason: normalizedReason,
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
			store: result.store
				? {
						...result.store,
						activePlan: result.store.billingSubscription
							? {
									id: result.store.billingSubscription.id,
									planCode: result.store.billingSubscription.planCode,
									status: result.store.billingSubscription.status,
									nextPaymentDueAt:
										result.store.billingSubscription.nextPaymentDueAt,
								}
							: null,
					}
				: null,
		};
	});
