import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	ISO_DATE_INPUT_REGEX,
	parseIsoDateInput,
} from '@/features/.server/admin-platform/billing/billing-date-input.lib';
import { addBillingPlanCycle } from '@/features/.server/admin-platform/billing/billing-plan-catalog.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const registerBillingPaymentInputSchema = z.object({
	subscriptionId: z.string().trim().min(1),
	amount: z.number().positive({
		error: () =>
			m.admin_billing_validation_amount_positive(
				{},
				{ locale: getLocaleFromAsyncStorage() },
			),
	}),
	paymentMethod: z
		.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'OTHER'])
		.default('BANK_TRANSFER'),
	paidAt: z.string().trim().regex(ISO_DATE_INPUT_REGEX).optional(),
	reference: z.string().trim().max(120).optional(),
	notes: z.string().trim().max(500).optional(),
});

export const registerBillingPaymentMutation = procedures.adminPlatform
	.input(registerBillingPaymentInputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();
		const fallbackPaidAtInput = new Date().toISOString().slice(0, 10);
		const paymentDate = parseIsoDateInput(
			input.paidAt ?? fallbackPaidAtInput,
			'end',
		);

		if (!paymentDate) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: m.admin_billing_validation_payment_date_invalid(
					{},
					{ locale },
				),
			});
		}

		const subscription = await prisma.billingSubscription.findUnique({
			where: {
				id: input.subscriptionId,
			},
			select: {
				id: true,
				targetType: true,
				planCode: true,
				status: true,
				mall: {
					select: {
						id: true,
						name: true,
					},
				},
				store: {
					select: {
						id: true,
						name: true,
						mall: {
							select: {
								id: true,
								name: true,
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

		const normalizedReference = input.reference?.trim() || null;
		const normalizedNotes = input.notes?.trim() || null;
		const nextPeriodEnd = addBillingPlanCycle(
			paymentDate,
			subscription.planCode,
		);
		const nextStatus = 'ACTIVE';

		const result = await prisma.$transaction(async (tx) => {
			const payment = await tx.billingPayment.create({
				data: {
					subscriptionId: subscription.id,
					amount: input.amount,
					currency: 'USD',
					paidAt: paymentDate,
					paymentMethod: input.paymentMethod,
					reference: normalizedReference,
					notes: normalizedNotes,
					registeredByUserId: ctx.user.id,
				},
				select: {
					id: true,
					amount: true,
					currency: true,
					paidAt: true,
					paymentMethod: true,
					reference: true,
					notes: true,
					createdAt: true,
					registeredByUser: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			const updatedSubscription = await tx.billingSubscription.update({
				where: {
					id: subscription.id,
				},
				data: {
					status: nextStatus,
					currentPeriodStart: paymentDate,
					currentPeriodEnd: nextPeriodEnd,
					nextPaymentDueAt: nextPeriodEnd,
					lastPaymentAt: paymentDate,
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

			return {
				payment,
				subscription: updatedSubscription,
			};
		});

		await writeAuditEventBestEffort({
			context: 'trpc.adminBilling.registerPayment',
			actorUserId: ctx.user.id,
			action: auditEventActions.ADMIN_BILLING_PAYMENT_REGISTERED,
			targetType: 'BillingPayment',
			targetId: result.payment.id,
			metadata: {
				subscriptionId: subscription.id,
				targetType: subscription.targetType,
				mallId: subscription.mall?.id ?? subscription.store?.mall.id ?? null,
				storeId: subscription.store?.id ?? null,
				amount: input.amount,
				currency: 'USD',
				paymentMethod: input.paymentMethod,
				paidAt: paymentDate.toISOString(),
				reference: normalizedReference,
				notes: normalizedNotes,
				previousStatus: subscription.status,
				nextStatus,
			},
		});

		return result;
	});
