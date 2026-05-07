import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

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

export const deleteGalleryImageMutation = procedures.adminCc
	.input(z.object({ mallId: z.string().cuid(), imageId: z.string() }))
	.mutation(async ({ input, ctx }) => {
		if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
		await assertMallAccess(ctx.user.id, input.mallId);
		const image = await prisma.mallGalleryImage.findUnique({
			where: { id: input.imageId },
			select: { mallId: true },
		});

		if (!image || image.mallId !== input.mallId) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Image not found' });
		}

		await prisma.mallGalleryImage.delete({ where: { id: input.imageId } });

		return { success: true };
	});
