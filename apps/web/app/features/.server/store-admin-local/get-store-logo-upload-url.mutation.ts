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

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export const getStoreLogoUploadUrlMutation = procedures.adminLocal
	.input(
		z.object({
			storeId: z.string().cuid(),
			contentType: z.string(),
			size: z.number().positive(),
		}),
	)
	.output(
		z.object({ uploadUrl: z.string(), publicUrl: z.string(), key: z.string() }),
	)
	.mutation(async ({ input, ctx }) => {
		const store = await prisma.store.findFirst({
			where: { id: input.storeId, ownerUserId: ctx.user.id },
			select: { id: true },
		});
		if (!store) throw new TRPCError({ code: 'FORBIDDEN' });

		if (!ALLOWED_CONTENT_TYPES.includes(input.contentType)) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Formato no compatible. Use JPG, PNG o WebP.',
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
		const key = `stores/${input.storeId}/logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

		const uploadUrl = await createUploadPresignedUrl(key, input.contentType);
		const publicUrl = `${STORAGE_PUBLIC_URL}/${STORAGE_BUCKET}/${key}`;

		return { uploadUrl, publicUrl, key };
	});
