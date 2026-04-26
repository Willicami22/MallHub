import { z } from 'zod';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const ISO_DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const listAuditEventsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	actionFilter: z.string().trim().min(1).optional(),
	actorFilter: z.string().trim().min(1).optional(),
	entityFilter: z.string().trim().min(1).optional(),
	dateFrom: z.string().regex(ISO_DATE_INPUT_REGEX).optional(),
	dateTo: z.string().regex(ISO_DATE_INPUT_REGEX).optional(),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const toDateBoundary = (
	input: string | undefined,
	boundary: 'start' | 'end',
): Date | undefined => {
	if (!input) {
		return undefined;
	}

	const date = new Date(
		`${input}T${boundary === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`,
	);

	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date;
};

const buildSearchWhere = (search: string): Prisma.AuditEventWhereInput => ({
	OR: [
		{
			action: {
				contains: search,
				mode: 'insensitive',
			},
		},
		{
			targetType: {
				contains: search,
				mode: 'insensitive',
			},
		},
		{
			targetId: {
				contains: search,
				mode: 'insensitive',
			},
		},
		{
			actorUser: {
				is: {
					OR: [
						{
							name: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							email: {
								contains: search,
								mode: 'insensitive',
							},
						},
					],
				},
			},
		},
	],
});

export type ListAuditEventsInput = z.infer<typeof listAuditEventsInputSchema>;

export const listAuditEventsQuery = procedures.adminPlatform
	.input(listAuditEventsInputSchema)
	.query(async ({ input }) => {
		const {
			page,
			pageSize,
			search,
			actionFilter,
			actorFilter,
			entityFilter,
			dateFrom,
			dateTo,
			sortDirection,
		} = input;

		const normalizedSearch = search?.trim();
		const normalizedActorFilter = actorFilter?.trim();
		const normalizedEntityFilter = entityFilter?.trim();
		const createdAtFrom = toDateBoundary(dateFrom, 'start');
		const createdAtTo = toDateBoundary(dateTo, 'end');

		const andFilters: Prisma.AuditEventWhereInput[] = [];

		if (actionFilter) {
			andFilters.push({ action: actionFilter });
		}

		if (createdAtFrom || createdAtTo) {
			andFilters.push({
				createdAt: {
					...(createdAtFrom ? { gte: createdAtFrom } : {}),
					...(createdAtTo ? { lte: createdAtTo } : {}),
				},
			});
		}

		if (normalizedActorFilter) {
			andFilters.push({
				actorUser: {
					is: {
						OR: [
							{
								name: {
									contains: normalizedActorFilter,
									mode: 'insensitive',
								},
							},
							{
								email: {
									contains: normalizedActorFilter,
									mode: 'insensitive',
								},
							},
						],
					},
				},
			});
		}

		if (normalizedEntityFilter) {
			andFilters.push({
				OR: [
					{
						targetType: {
							contains: normalizedEntityFilter,
							mode: 'insensitive',
						},
					},
					{
						targetId: {
							contains: normalizedEntityFilter,
							mode: 'insensitive',
						},
					},
				],
			});
		}

		if (normalizedSearch) {
			andFilters.push(buildSearchWhere(normalizedSearch));
		}

		const where: Prisma.AuditEventWhereInput =
			andFilters.length > 0 ? { AND: andFilters } : {};

		const [events, total, actionTypes] = await Promise.all([
			prisma.auditEvent.findMany({
				where,
				select: {
					id: true,
					action: true,
					targetType: true,
					targetId: true,
					outcome: true,
					metadataJson: true,
					createdAt: true,
					actorUser: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
						},
					},
				},
				orderBy: { createdAt: sortDirection },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.auditEvent.count({ where }),
			prisma.auditEvent.findMany({
				distinct: ['action'],
				select: { action: true },
				orderBy: { action: 'asc' },
			}),
		]);

		return {
			events,
			total,
			page,
			pageSize,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
			actionTypes: actionTypes.map(({ action }) => action),
		};
	});
