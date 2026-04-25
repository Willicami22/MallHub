import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listStoreRegistrationsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	mallId: z.string().trim().min(1).optional(),
	statusFilter: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	sortBy: z.enum(['createdAt', 'storeName', 'status']).default('createdAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const getStoreRegistrationOrderBy = (
	sortBy: z.infer<typeof listStoreRegistrationsInputSchema>['sortBy'],
	sortDirection: z.infer<
		typeof listStoreRegistrationsInputSchema
	>['sortDirection'],
): Prisma.StoreRegistrationRequestOrderByWithRelationInput => {
	if (sortBy === 'storeName') {
		return {
			storeName: sortDirection,
		};
	}

	if (sortBy === 'status') {
		return {
			status: sortDirection,
		};
	}

	return {
		createdAt: sortDirection,
	};
};

export type ListStoreRegistrationsInput = z.infer<
	typeof listStoreRegistrationsInputSchema
>;

export const listStoreRegistrationsQuery = procedures.adminPlatform
	.input(listStoreRegistrationsInputSchema)
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

		const where: Prisma.StoreRegistrationRequestWhereInput = {
			...(mallId ? { mallId } : {}),
			...(statusFilter ? { status: statusFilter } : {}),
			...(normalizedSearch
				? {
						OR: [
							{
								storeName: {
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
								contactEmail: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								applicant: {
									name: {
										contains: normalizedSearch,
										mode: 'insensitive',
									},
								},
							},
							{
								applicant: {
									email: {
										contains: normalizedSearch,
										mode: 'insensitive',
									},
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

		const [registrationRequests, total] = await Promise.all([
			prisma.storeRegistrationRequest.findMany({
				where,
				select: {
					id: true,
					storeName: true,
					category: true,
					status: true,
					reviewNotes: true,
					createdAt: true,
					updatedAt: true,
					reviewedAt: true,
					mall: {
						select: {
							id: true,
							name: true,
						},
					},
					applicant: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					reviewedBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					createdStore: {
						select: {
							id: true,
							name: true,
							status: true,
						},
					},
				},
				orderBy: getStoreRegistrationOrderBy(sortBy, sortDirection),
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.storeRegistrationRequest.count({ where }),
		]);

		return {
			registrationRequests,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	});
