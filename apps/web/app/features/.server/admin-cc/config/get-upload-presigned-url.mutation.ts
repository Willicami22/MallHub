import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import {
	createUploadPresignedUrl,
	ensureBucket,
	STORAGE_BUCKET,
	STORAGE_PUBLIC_URL,
} from '@/features/.server/storage/storage.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const ALLOWED_CONTENT_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

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

export const getUploadPresignedUrlMutation = procedures.adminCc
	.input(
		z.object({
			contentType: z.string(),
			folder: z.enum(['logos', 'heroes', 'gallery']),
			mallId: z.string().cuid(),
			size: z.number().positive(),
		}),
	)
	.output(
		z.object({ uploadUrl: z.string(), publicUrl: z.string(), key: z.string() }),
	)
	.mutation(async ({ input, ctx }) => {
		if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
		await assertMallAccess(ctx.user.id, input.mallId);
		if (!ALLOWED_CONTENT_TYPES.includes(input.contentType)) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Formato no compatible. Use JPG, PNG, WebP o GIF.',
			});
		}

		if (input.size > MAX_BYTES) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'El archivo supera el límite de 5 MB.',
			});
		}

		await ensureBucket();

		const ext = input.contentType.split('/')[1];
		const key = `malls/${input.mallId}/${input.folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

		const uploadUrl = await createUploadPresignedUrl(key, input.contentType);
		const publicUrl = `${STORAGE_PUBLIC_URL}/${STORAGE_BUCKET}/${key}`;

		return { uploadUrl, publicUrl, key };
	});
