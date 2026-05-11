import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const updateMallImagesInput = z.object({
	mallId: z.string().cuid(),
	logoImageUrl: z.string().nullable().optional(),
	heroImageUrl: z.string().nullable().optional(),
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

export const updateMallImagesMutation = procedures.adminCc
	.input(updateMallImagesInput)
	.mutation(async ({ input, ctx }) => {
		if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
		await assertMallAccess(ctx.user.id, input.mallId);
		await prisma.mall.update({
			where: { id: input.mallId },
			data: {
				...(input.logoImageUrl !== undefined && {
					logoImageUrl: input.logoImageUrl,
				}),
				...(input.heroImageUrl !== undefined && {
					heroImageUrl: input.heroImageUrl,
				}),
			},
		});

		return { success: true };
	});
