import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';

const listUsersInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	search: z.string().trim().optional(),
	roleFilter: z
		.enum([
			appRoles.CUSTOMER,
			appRoles.ADMIN_LOCAL,
			appRoles.ADMIN_CC,
			appRoles.ADMIN_PLATFORM,
		])
		.optional(),
	sortBy: z.enum(['name', 'email', 'role', 'createdAt']).default('createdAt'),
	sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type ListUsersInput = z.infer<typeof listUsersInputSchema>;

export const listUsersQuery = procedures.adminPlatform
	.input(listUsersInputSchema)
	.query(async ({ input }) => {
		const { page, pageSize, search, roleFilter, sortBy, sortDirection } = input;

		const where = {
			...(roleFilter ? { role: roleFilter } : {}),
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: 'insensitive' as const } },
							{ email: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: {}),
		};

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
					banned: true,
					banReason: true,
					banExpires: true,
					emailVerified: true,
					createdAt: true,
				},
				orderBy: { [sortBy]: sortDirection },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.user.count({ where }),
		]);

		return {
			users,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	});
