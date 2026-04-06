import 'dotenv/config';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { serverEnv } from '@/features/.server/env/server-env.lib';
import { prisma } from '@/features/.server/prisma/prisma.client';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';

async function seed() {
	console.log('Starting database seeding...');

	const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = serverEnv;

	const existingAdmin = await prisma.user.findUnique({
		where: { email: ADMIN_EMAIL },
		select: { id: true },
	});

	if (!existingAdmin) {
		await auth.api.signUpEmail({
			body: {
				email: ADMIN_EMAIL,
				name: ADMIN_NAME,
				password: ADMIN_PASSWORD,
			},
			asResponse: false,
		});
	}

	await prisma.user.update({
		where: { email: ADMIN_EMAIL },
		data: {
			name: ADMIN_NAME,
			role: appRoles.ADMIN_PLATFORM,
			emailVerified: true,
		},
	});
}

void seed();
