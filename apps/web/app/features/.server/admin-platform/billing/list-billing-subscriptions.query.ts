import { z } from 'zod';
import {
	getBillingStatusFilterWhere,
	getBillingSubscriptionEffectiveStatus,
} from '@/features/.server/admin-platform/billing/billing-subscription-status.lib';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listBillingSubscriptionsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	targetTypeFilter: z.enum(['MALL', 'STORE']).optional(),
	statusFilter: z.enum(['ACTIVE', 'OVERDUE', 'SUSPENDED']).optional(),
	planFilter: z.enum(['BASIC', 'STANDARD', 'PREMIUM']).optional(),
	sortBy: z
		.enum(['updatedAt', 'nextPaymentDueAt', 'planCode'])
		.default('updatedAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const getOrderBy = (
	sortBy: z.infer<typeof listBillingSubscriptionsInputSchema>['sortBy'],
	sortDirection: z.infer<
		typeof listBillingSubscriptionsInputSchema
	>['sortDirection'],
): Prisma.BillingSubscriptionOrderByWithRelationInput => {
	if (sortBy === 'planCode') {
		return {
			planCode: sortDirection,
		};
	}

	if (sortBy === 'nextPaymentDueAt') {
		return {
			nextPaymentDueAt: sortDirection,
		};
	}

	return {
		updatedAt: sortDirection,
	};
};

export const listBillingSubscriptionsQuery = procedures.adminPlatform
	.input(listBillingSubscriptionsInputSchema)
	.query(async ({ input }) => {
		const {
			page,
			pageSize,
			search,
			targetTypeFilter,
			statusFilter,
			planFilter,
			sortBy,
			sortDirection,
		} = input;
		const normalizedSearch = search?.trim();
		const now = new Date();
		const statusWhere = getBillingStatusFilterWhere(statusFilter, now);

		const where: Prisma.BillingSubscriptionWhereInput = {
			...(targetTypeFilter ? { targetType: targetTypeFilter } : {}),
			...(planFilter ? { planCode: planFilter } : {}),
			...(statusWhere ? { AND: [statusWhere] } : {}),
			...(normalizedSearch
				? {
						OR: [
							{
								mall: {
									is: {
										OR: [
											{
												name: {
													contains: normalizedSearch,
													mode: 'insensitive',
												},
											},
											{
												city: {
													contains: normalizedSearch,
													mode: 'insensitive',
												},
											},
										],
									},
								},
							},
							{
								store: {
									is: {
										OR: [
											{
												name: {
													contains: normalizedSearch,
													mode: 'insensitive',
												},
											},
											{
												mall: {
													is: {
														name: {
															contains: normalizedSearch,
															mode: 'insensitive',
														},
													},
												},
											},
										],
									},
								},
							},
						],
					}
				: {}),
		};

		const [subscriptions, total] = await Promise.all([
			prisma.billingSubscription.findMany({
				where,
				select: {
					id: true,
					targetType: true,
					planCode: true,
					status: true,
					recurringAmount: true,
					currentPeriodStart: true,
					currentPeriodEnd: true,
					nextPaymentDueAt: true,
					lastPaymentAt: true,
					updatedAt: true,
					mall: {
						select: {
							id: true,
							name: true,
							city: true,
							status: true,
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
				orderBy: getOrderBy(sortBy, sortDirection),
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.billingSubscription.count({ where }),
		]);

		return {
			subscriptions: subscriptions.map((subscription) => {
				const effectiveStatus = getBillingSubscriptionEffectiveStatus(
					subscription.status,
					subscription.nextPaymentDueAt,
					now,
				);

				return {
					...subscription,
					effectiveStatus,
					overdueAmount:
						effectiveStatus === 'OVERDUE' ? subscription.recurringAmount : null,
				};
			}),
			total,
			page,
			pageSize,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		};
	});
