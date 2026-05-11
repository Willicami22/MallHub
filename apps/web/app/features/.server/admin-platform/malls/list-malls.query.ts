import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const listMallsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	statusFilter: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
	sortBy: z.enum(['name', 'city', 'status', 'createdAt']).default('createdAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type ListMallsInput = z.infer<typeof listMallsInputSchema>;

export const listMallsQuery = procedures.adminPlatform
	.input(listMallsInputSchema)
	.query(async ({ input }) => {
		const { page, pageSize, search, statusFilter, sortBy, sortDirection } =
			input;
		const normalizedSearch = search?.trim();

		const where: Prisma.MallWhereInput = {
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
								city: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
							{
								address: {
									contains: normalizedSearch,
									mode: 'insensitive',
								},
							},
						],
					}
				: {}),
		};

		const [malls, total] = await Promise.all([
			prisma.mall.findMany({
				where,
				select: {
					id: true,
					name: true,
					city: true,
					status: true,
					createdAt: true,
					adminCcUser: {
						select: {
							id: true,
							name: true,
							email: true,
							banned: true,
						},
					},
				},
				orderBy: { [sortBy]: sortDirection },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.mall.count({ where }),
		]);

		const mallIds = malls.map((mall) => mall.id);
		const activeStoresByMall =
			mallIds.length > 0
				? await prisma.store.groupBy({
						by: ['mallId'],
						where: {
							mallId: {
								in: mallIds,
							},
							status: 'ACTIVE',
						},
						_count: {
							_all: true,
						},
					})
				: [];
		const activeStoreCountByMallId = new Map(
			activeStoresByMall.map((item) => [item.mallId, item._count._all]),
		);

		return {
			malls: malls.map((mall) => ({
				...mall,
				activeStoreCount: activeStoreCountByMallId.get(mall.id) ?? 0,
			})),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	});
