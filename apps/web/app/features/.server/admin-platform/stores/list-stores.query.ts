import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listStoresInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	mallId: z.string().trim().min(1).optional(),
	statusFilter: z
		.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED'])
		.optional(),
	planFilter: z.enum(['NOT_CONFIGURED']).optional(),
	sortBy: z
		.enum(['name', 'status', 'createdAt', 'mallName'])
		.default('createdAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const getStoreListOrderBy = (
	sortBy: z.infer<typeof listStoresInputSchema>['sortBy'],
	sortDirection: z.infer<typeof listStoresInputSchema>['sortDirection'],
): Prisma.StoreOrderByWithRelationInput => {
	if (sortBy === 'name') {
		return {
			name: sortDirection,
		};
	}

	if (sortBy === 'status') {
		return {
			status: sortDirection,
		};
	}

	if (sortBy === 'mallName') {
		return {
			mall: {
				name: sortDirection,
			},
		};
	}

	return {
		createdAt: sortDirection,
	};
};

export type ListStoresInput = z.infer<typeof listStoresInputSchema>;

export const listStoresQuery = procedures.adminPlatform
	.input(listStoresInputSchema)
	.query(async ({ input }) => {
		const {
			page,
			pageSize,
			search,
			mallId,
			statusFilter,
			sortBy,
			sortDirection,
		} = input;
		const normalizedSearch = search?.trim();

		const where: Prisma.StoreWhereInput = {
			...(mallId ? { mallId } : {}),
			...(statusFilter ? { status: statusFilter } : {}),
			...(normalizedSearch
				? {
						OR: [
							{
								name: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								category: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								description: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								contactEmail: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								mall: {
									name: {
										contains: normalizedSearch,
										mode: 'insensitive',
									},
								},
							},
						],
					}
				: {}),
		};

		const [stores, total] = await Promise.all([
			prisma.store.findMany({
				where,
				select: {
					id: true,
					name: true,
					status: true,
					category: true,
					createdAt: true,
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
				orderBy: getStoreListOrderBy(sortBy, sortDirection),
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.store.count({ where }),
		]);

		return {
			stores: stores.map((store) => ({
				...store,
				activePlan: null,
			})),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	});
