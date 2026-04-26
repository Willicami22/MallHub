import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const getBillingSubscriptionInputSchema = z.object({
	subscriptionId: z.string().trim().min(1),
});

export const getBillingSubscriptionQuery = procedures.adminPlatform
	.input(getBillingSubscriptionInputSchema)
	.query(async ({ input }) => {
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
				payments: {
					orderBy: {
						paidAt: 'desc',
					},
					take: 20,
					select: {
						id: true,
						amount: true,
						currency: true,
						paidAt: true,
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
				},
				collectionAlerts: {
					orderBy: {
						sentAt: 'desc',
					},
					take: 20,
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
				},
			},
		});

		if (!subscription) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_billing_subscription_not_found({}, { locale }),
			});
		}

		return { subscription };
	});
