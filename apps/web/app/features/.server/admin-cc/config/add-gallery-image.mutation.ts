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

export const addGalleryImageMutation = procedures.adminCc
	.input(
		z.object({
			mallId: z.string().cuid(),
			imageUrl: z.string().url(),
			label: z.string().optional(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
		await assertMallAccess(ctx.user.id, input.mallId);
		const lastImage = await prisma.mallGalleryImage.findFirst({
			where: { mallId: input.mallId },
			orderBy: { sortOrder: 'desc' },
			select: { sortOrder: true },
		});

		const image = await prisma.mallGalleryImage.create({
			data: {
				mallId: input.mallId,
				imageUrl: input.imageUrl,
				label: input.label ?? null,
				sortOrder: (lastImage?.sortOrder ?? -1) + 1,
			},
		});

		return {
			id: image.id,
			imageUrl: image.imageUrl,
			label: image.label,
			sortOrder: image.sortOrder,
		};
	});
