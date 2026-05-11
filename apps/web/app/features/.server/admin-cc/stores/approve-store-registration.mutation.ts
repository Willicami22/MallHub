import { TRPCError } from '@trpc/server';
import { addDays } from 'date-fns';
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

export const approveStoreRegistrationMutation = procedures.adminCc
	.input(z.object({ registrationRequestId: z.string().trim().min(1) }))
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const approvedAt = new Date();

		const result = await prisma.$transaction(async (tx) => {
			const request = await tx.storeRegistrationRequest.findUnique({
				where: { id: input.registrationRequestId },
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
						select: { id: true, name: true, email: true },
					},
					mall: {
						select: {
							id: true,
							name: true,
							adminCcUser: {
								select: { id: true, name: true, email: true },
							},
						},
					},
				},
			});

			if (!request) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: m.admin_cc_stores_not_found({}, { locale }),
				});
			}

			if (request.status !== 'PENDING') {
				throw new TRPCError({
					code: 'CONFLICT',
					message: m.admin_cc_stores_registration_not_pending({}, { locale }),
				});
			}

			const storeData = {
				mallId: request.mallId,
				ownerUserId: request.applicantUserId,
				name: request.storeName,
				category: request.category,
				description: request.description,
				contactEmail: request.contactEmail,
				phone: request.contactPhone,
				status: 'ACTIVE' as const,
			};

			const storeSelect = {
				id: true,
				name: true,
				category: true,
				status: true,
				createdAt: true,
				mall: { select: { id: true, name: true } },
				owner: { select: { id: true, name: true, email: true } },
			};

			const store = request.createdStoreId
				? await tx.store.update({
						where: { id: request.createdStoreId },
						data: storeData,
						select: storeSelect,
					})
				: await tx.store.create({ data: storeData, select: storeSelect });

			const currentPeriodStart = new Date();
			const currentPeriodEnd = addDays(currentPeriodStart, 30);
			await tx.billingSubscription.upsert({
				where: { storeId: store.id },
				create: {
					targetType: 'STORE',
					storeId: store.id,
					planCode: 'BASIC',
					status: 'ACTIVE',
					currentPeriodStart,
					currentPeriodEnd,
					nextPaymentDueAt: currentPeriodEnd,
					createdByUserId: ctx.user.id,
					updatedByUserId: ctx.user.id,
				},
				update: { updatedByUserId: ctx.user.id },
			});

			const reviewedRequest = await tx.storeRegistrationRequest.update({
				where: { id: request.id },
				data: {
					status: 'APPROVED',
					reviewNotes: null,
					reviewedByUserId: ctx.user.id,
					reviewedAt: approvedAt,
					createdStoreId: store.id,
				},
				select: { id: true, status: true },
			});

			return { request, reviewedRequest, store };
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminCcStores.approveRegistration',
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

		return { registrationRequest: result.reviewedRequest, store: result.store };
	});
