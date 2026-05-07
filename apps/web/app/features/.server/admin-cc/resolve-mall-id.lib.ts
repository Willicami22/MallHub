import { prisma } from '@/features/.server/prisma/prisma.server';

type UserCtx = { id?: string; preferredMallId?: string | null };

/**
 * Resolves the mall ID for an Admin CC user using three fallbacks:
 * 1. session.user.preferredMallId (may be absent — Better Auth doesn't expose custom fields by default)
 * 2. AdminCcAssignment record for this user
 * 3. First active mall in the database
 */
export async function resolveMallIdForAdminCc(
	user: UserCtx,
): Promise<string | null> {
	let mallId: string | null = user.preferredMallId ?? null;

	if (!mallId && user.id) {
		const assignment = await prisma.adminCcAssignment.findFirst({
			where: { adminCcUserId: user.id },
			select: { mallId: true },
		});

		mallId = assignment?.mallId ?? null;
	}

	if (!mallId) {
		const firstMall = await prisma.mall.findFirst({
			where: { status: 'ACTIVE' },
			select: { id: true },
			orderBy: { createdAt: 'asc' },
		});

		mallId = firstMall?.id ?? null;
	}

	return mallId;
}
