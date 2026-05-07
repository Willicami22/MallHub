import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

const openHourSchema = z.object({
	day: z.string(),
	open: z.string(),
	close: z.string(),
	closed: z.boolean().default(false),
});

const socialLinksSchema = z.object({
	instagram: z.string().default(''),
	facebook: z.string().default(''),
	website: z.string().default(''),
});

const DEFAULT_HOURS = [
	{ day: 'Lunes', open: '09:00', close: '20:00', closed: false },
	{ day: 'Martes', open: '09:00', close: '20:00', closed: false },
	{ day: 'Miércoles', open: '09:00', close: '20:00', closed: false },
	{ day: 'Jueves', open: '09:00', close: '20:00', closed: false },
	{ day: 'Viernes', open: '09:00', close: '21:00', closed: false },
	{ day: 'Sábado', open: '10:00', close: '22:00', closed: false },
	{ day: 'Domingo', open: '10:00', close: '19:00', closed: false },
];

const DEFAULT_SOCIAL = { instagram: '', facebook: '', website: '' };

async function resolveMallId(userId: string): Promise<string> {
	const assignment = await prisma.adminCcAssignment.findFirst({
		where: { adminCcUserId: userId },
		select: { mallId: true },
	});
	if (assignment) return assignment.mallId;

	const mall = await prisma.mall.findFirst({
		where: { adminCcUserId: userId },
		select: { id: true },
	});
	if (mall) return mall.id;

	throw new TRPCError({ code: 'NOT_FOUND', message: 'No mall found' });
}

export const getMallConfigQuery = procedures.adminCc.query(async ({ ctx }) => {
	if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
	const mallId = await resolveMallId(ctx.user.id);

	const mall = await prisma.mall.findUnique({
		where: { id: mallId },
		include: {
			galleryImages: { orderBy: { sortOrder: 'asc' } },
		},
	});

	if (!mall) {
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Mall not found' });
	}

	const openHours = mall.openHoursJson
		? (z.array(openHourSchema).safeParse(mall.openHoursJson).data ??
			DEFAULT_HOURS)
		: DEFAULT_HOURS;

	const socialLinks = mall.socialLinksJson
		? (socialLinksSchema.safeParse(mall.socialLinksJson).data ?? DEFAULT_SOCIAL)
		: DEFAULT_SOCIAL;

	return {
		mallId: mall.id,
		name: mall.name,
		city: mall.city,
		address: mall.address,
		description: mall.description ?? '',
		phone: mall.phone ?? '',
		logoImageUrl: mall.logoImageUrl ?? null,
		heroImageUrl: mall.heroImageUrl ?? null,
		openHours,
		socialLinks,
		galleryImages: mall.galleryImages.map((img) => ({
			id: img.id,
			imageUrl: img.imageUrl,
			label: img.label,
			sortOrder: img.sortOrder,
		})),
	};
});
