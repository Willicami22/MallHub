import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyBillingCollectionAlert } from '@/features/.server/admin-platform/billing/billing-notification.lib';
import { collectBillingRecipients } from '@/features/.server/admin-platform/billing/billing-recipients.lib';
import { getBillingSubscriptionEffectiveStatus } from '@/features/.server/admin-platform/billing/billing-subscription-status.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const sendBillingCollectionAlertInputSchema = z.object({
	subscriptionId: z.string().trim().min(1),
	reason: z.string().trim().max(500).optional(),
});

export const sendBillingCollectionAlertMutation = procedures.adminPlatform
	.input(sendBillingCollectionAlertInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const subscription = await prisma.billingSubscription.findUnique({
			where: {
				id: input.subscriptionId,
			},
			select: {
				id: true,
				targetType: true,
				planCode: true,
				status: true,
				nextPaymentDueAt: true,
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
				store: {
					select: {
						id: true,
						name: true,
						owner: {
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
				},
			},
		});

		if (!subscription) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_billing_subscription_not_found({}, { locale }),
			});
		}

		const effectiveStatus = getBillingSubscriptionEffectiveStatus(
			subscription.status,
			subscription.nextPaymentDueAt,
		);
		if (effectiveStatus !== 'OVERDUE') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_billing_collection_alert_only_overdue({}, { locale }),
			});
		}

		const normalizedReason = input.reason?.trim() || null;
		const alert = await prisma.billingCollectionAlert.create({
			data: {
				subscriptionId: subscription.id,
				reason: normalizedReason,
				createdByUserId: ctx.user.id,
			},
			select: {
				id: true,
				reason: true,
				sentAt: true,
				createdAt: true,
				createdByUser: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminBilling.sendCollectionAlert',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_BILLING_COLLECTION_ALERT_SENT,
			targetType: 'BillingCollectionAlert',
			targetId: alert.id,
			metadata: {
				subscriptionId: subscription.id,
				targetType: subscription.targetType,
				mallId: subscription.mall?.id ?? subscription.store?.mall.id ?? null,
				storeId: subscription.store?.id ?? null,
				reason: normalizedReason,
				nextPaymentDueAt: subscription.nextPaymentDueAt?.toISOString() ?? null,
			},
		});

		notifyBillingCollectionAlert({
			subscriptionId: subscription.id,
			targetType: subscription.targetType,
			targetName:
				subscription.targetType === 'MALL'
					? (subscription.mall?.name ?? '')
					: (subscription.store?.name ?? ''),
			planCode: subscription.planCode,
			nextPaymentDueAt: subscription.nextPaymentDueAt,
			reason: normalizedReason,
			changedByName: ctx.user.name,
			recipients: collectBillingRecipients(
				subscription.mall?.adminCcUser ?? null,
				subscription.store?.owner ?? null,
				subscription.store?.mall.adminCcUser ?? null,
			),
		});

		return { alert };
	});
