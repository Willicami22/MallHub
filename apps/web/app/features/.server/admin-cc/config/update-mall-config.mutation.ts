import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const openHourSchema = z.object({
	day: z.string(),
	open: z.string(),
	close: z.string(),
	closed: z.boolean(),
});

const socialLinksSchema = z.object({
	instagram: z.string(),
	facebook: z.string(),
	website: z.string(),
});

const updateMallConfigInput = z.object({
	mallId: z.string().cuid(),
	name: z.string().min(1, 'El nombre es obligatorio'),
	city: z.string().min(1, 'La ciudad es obligatoria'),
	address: z.string().min(1, 'La dirección es obligatoria'),
	description: z.string().optional(),
	phone: z.string().optional(),
	openHours: z.array(openHourSchema).optional(),
	socialLinks: socialLinksSchema.optional(),
});

async function assertMallAccess(userId: string, mallId: string) {
	const assignment = await prisma.adminCcAssignment.findFirst({
		where: { adminCcUserId: userId, mallId },
		select: { mallId: true },
	});
	if (assignment) return;
	const mall = await prisma.mall.findFirst({
		where: { id: mallId, adminCcUserId: userId },
		select: { id: true },
	});
	if (!mall) throw new TRPCError({ code: 'FORBIDDEN' });
}

export const updateMallConfigMutation = procedures.adminCc
	.input(updateMallConfigInput)
	.mutation(async ({ input, ctx }) => {
		if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
		await assertMallAccess(ctx.user.id, input.mallId);
		await prisma.mall.update({
			where: { id: input.mallId },
			data: {
				name: input.name,
				city: input.city,
				address: input.address,
				description: input.description ?? null,
				phone: input.phone ?? null,
				...(input.openHours !== undefined && {
					openHoursJson: input.openHours,
				}),
				...(input.socialLinks !== undefined && {
					socialLinksJson: input.socialLinks,
				}),
			},
		});

		return { success: true };
	});
