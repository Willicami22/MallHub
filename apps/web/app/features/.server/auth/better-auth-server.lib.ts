import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/features/.server/prisma/prisma.client';

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
	},
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
});

export type Session = typeof auth.$Infer.Session;
