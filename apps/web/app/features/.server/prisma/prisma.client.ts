import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { serverEnv } from '@/features/.server/env/server-env.lib';
import { PrismaClient } from '@/features/.server/prisma/generated/client';

const createPrismaClient = () => {
	const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

	return new PrismaClient({
		adapter,
	});
};

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
	prisma?: PrismaClientSingleton;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
