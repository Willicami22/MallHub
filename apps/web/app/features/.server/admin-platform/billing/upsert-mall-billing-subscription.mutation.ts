import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	ISO_DATE_INPUT_REGEX,
	parseIsoDateInput,
} from '@/features/.server/admin-platform/billing/billing-date-input.lib';
import { notifyBillingPlanChange } from '@/features/.server/admin-platform/billing/billing-notification.lib';
import { addBillingPlanCycle } from '@/features/.server/admin-platform/billing/billing-plan-catalog.lib';
import { collectBillingRecipients } from '@/features/.server/admin-platform/billing/billing-recipients.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const upsertMallBillingSubscriptionInputSchema = z.object({
	mallId: z.string().trim().min(1),
	planCode: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
	status: z.enum(['ACTIVE', 'OVERDUE', 'SUSPENDED']).default('ACTIVE'),
	currentPeriodStart: z
		.string()
		.trim()
		.min(1, {
			error: () =>
				m.admin_billing_validation_current_period_start_required(
					{},
					{ locale: getLocaleFromAsyncStorage() },
				),
		})
		.regex(ISO_DATE_INPUT_REGEX),
	nextPaymentDueAt: z.string().trim().regex(ISO_DATE_INPUT_REGEX).optional(),
	reason: z.string().trim().max(500).optional(),
});

export const upsertMallBillingSubscriptionMutation = procedures.adminPlatform
	.input(upsertMallBillingSubscriptionInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const periodStart = parseIsoDateInput(input.currentPeriodStart);
		if (!periodStart) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_billing_validation_date_invalid({}, { locale }),
			});
		}

		const requestedNextDueAt = parseIsoDateInput(input.nextPaymentDueAt);
		if (input.nextPaymentDueAt && !requestedNextDueAt) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_billing_validation_date_invalid({}, { locale }),
			});
		}

		const computedPeriodEnd = addBillingPlanCycle(periodStart, input.planCode);
		const nextPaymentDueAt = requestedNextDueAt ?? computedPeriodEnd;
		if (nextPaymentDueAt < periodStart) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_billing_validation_due_before_period({}, { locale }),
			});
		}

		const mall = await prisma.mall.findUnique({
			where: {
				id: input.mallId,
			},
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
		});

		if (!mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_billing_mall_not_found({}, { locale }),
			});
		}

		const previousSubscription = await prisma.billingSubscription.findUnique({
			where: {
				mallId: mall.id,
			},
			select: {
				id: true,
				planCode: true,
				status: true,
			},
		});

		const normalizedReason = input.reason?.trim() || null;
		const subscription = await prisma.billingSubscription.upsert({
			where: {
				mallId: mall.id,
			},
			create: {
				targetType: 'MALL',
				mallId: mall.id,
				planCode: input.planCode,
				status: input.status,
				currentPeriodStart: periodStart,
				currentPeriodEnd: computedPeriodEnd,
				nextPaymentDueAt,
				createdByUserId: ctx.user.id,
				updatedByUserId: ctx.user.id,
			},
			update: {
				planCode: input.planCode,
				status: input.status,
				currentPeriodStart: periodStart,
				currentPeriodEnd: computedPeriodEnd,
				nextPaymentDueAt,
				updatedByUserId: ctx.user.id,
			},
			select: {
				id: true,
				targetType: true,
				planCode: true,
				status: true,
				currentPeriodStart: true,
				currentPeriodEnd: true,
				nextPaymentDueAt: true,
				lastPaymentAt: true,
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
							},
						},
					},
				},
				store: {
					select: {
						id: true,
						name: true,
						status: true,
						mall: {
							select: {
								id: true,
								name: true,
								city: true,
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
				},
			},
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminBilling.upsertMallSubscription',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_BILLING_MALL_PLAN_SET,
			targetType: 'BillingSubscription',
			targetId: subscription.id,
			metadata: {
				mallId: mall.id,
				previousPlanCode: previousSubscription?.planCode ?? null,
				nextPlanCode: subscription.planCode,
				previousStatus: previousSubscription?.status ?? null,
				nextStatus: subscription.status,
				currentPeriodStart: periodStart.toISOString(),
				nextPaymentDueAt: nextPaymentDueAt.toISOString(),
				reason: normalizedReason,
			},
		});

		notifyBillingPlanChange({
			subscriptionId: subscription.id,
			targetType: 'MALL',
			targetName: mall.name,
			planCode: subscription.planCode,
			status: subscription.status,
			nextPaymentDueAt: subscription.nextPaymentDueAt,
			reason: normalizedReason,
			changedByName: ctx.user.name,
			recipients: collectBillingRecipients(
				subscription.mall?.adminCcUser ?? null,
			),
		});

		return { subscription };
	});
