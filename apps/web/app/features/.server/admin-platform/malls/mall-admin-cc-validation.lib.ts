import { TRPCError } from '@trpc/server';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

type AdminCcUser = {
	id: string;
	name: string;
	email: string;
	banned: boolean | null;
};

export const ensureMallAdminCcUserIsAssignable = async (
	adminCcUserId: string,
): Promise<AdminCcUser> => {
	const locale = getLocaleFromAsyncStorage();
	const adminCcUser = await prisma.user.findUnique({
		where: { id: adminCcUserId },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			banned: true,
		},
	});

	if (!adminCcUser) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: m.admin_malls_admin_cc_not_found({}, { locale }),
		});
	}

	if (adminCcUser.role !== appRoles.ADMIN_CC) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: m.admin_malls_admin_cc_invalid_role({}, { locale }),
		});
	}

	if (adminCcUser.banned) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: m.admin_malls_admin_cc_banned({}, { locale }),
		});
	}

	return {
		id: adminCcUser.id,
		name: adminCcUser.name,
		email: adminCcUser.email,
		banned: adminCcUser.banned,
	};
};
