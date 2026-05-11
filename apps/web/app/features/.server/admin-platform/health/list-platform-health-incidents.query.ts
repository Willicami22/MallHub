import { z } from 'zod';
import {
	PLATFORM_HEALTH_INCIDENT_STATUSES,
	PLATFORM_SERVICE_KEYS,
} from '@/features/.server/admin-platform/health/platform-health-adapters.lib';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const ISO_DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const listPlatformHealthIncidentsInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	statusFilter: z.enum(PLATFORM_HEALTH_INCIDENT_STATUSES).optional(),
	serviceFilter: z.enum(PLATFORM_SERVICE_KEYS).optional(),
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

export const listPlatformHealthIncidentsQuery = procedures.adminPlatform
	.input(listPlatformHealthIncidentsInputSchema)
	.query(async ({ input }) => {
		const {
			page,
			pageSize,
			search,
			statusFilter,
			serviceFilter,
			dateFrom,
			dateTo,
			sortDirection,
		} = input;

		const normalizedSearch = search?.trim();
		const startedAtFrom = toDateBoundary(dateFrom, 'start');
		const startedAtTo = toDateBoundary(dateTo, 'end');
		const where: Prisma.PlatformHealthIncidentWhereInput = {
			...(statusFilter ? { status: statusFilter } : {}),
			...(serviceFilter ? { serviceKey: serviceFilter } : {}),
			...(startedAtFrom || startedAtTo
				? {
						startedAt: {
							...(startedAtFrom ? { gte: startedAtFrom } : {}),
							...(startedAtTo ? { lte: startedAtTo } : {}),
						},
					}
				: {}),
			...(normalizedSearch
				? {
						summaryCode: {
							contains: normalizedSearch,
							mode: 'insensitive',
						},
					}
				: {}),
		};

		const [incidents, total] = await Promise.all([
			prisma.platformHealthIncident.findMany({
				where,
				select: {
					id: true,
					serviceKey: true,
					status: true,
					summaryCode: true,
					summaryParamsJson: true,
					metadataJson: true,
					startedAt: true,
					resolvedAt: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: {
					startedAt: sortDirection,
				},
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.platformHealthIncident.count({ where }),
		]);

		return {
			incidents,
			total,
			page,
			pageSize,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		};
	});
