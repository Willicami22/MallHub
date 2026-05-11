import {
	accessibleBy,
	createPrismaAbilityFor,
	type PrismaModel,
	type PrismaQueryOf,
	type Subjects,
	type WhereInputOf,
} from '@casl/prisma';
import type * as PrismaClient from '@/features/.server/prisma/generated/client';

export { ParsingQueryError, prismaQuery } from '@casl/prisma';

export const createPrismaAbility =
	createPrismaAbilityFor<PrismaClient.Prisma.TypeMap>();

export type PrismaQuery<T extends PrismaModel = PrismaModel> = PrismaQueryOf<
	PrismaClient.Prisma.TypeMap,
	T
>;

export type WhereInput<TModelName extends PrismaClient.Prisma.ModelName> =
	WhereInputOf<PrismaClient.Prisma.TypeMap, TModelName>;

export type AppSubjects =
	| 'all'
	| Subjects<{
			User: PrismaClient.User;
			UserProfile: PrismaClient.UserProfile;
			Mall: PrismaClient.Mall;
			Store: PrismaClient.Store;
			StoreRegistrationRequest: PrismaClient.StoreRegistrationRequest;
			Product: PrismaClient.Product;
			Promotion: PrismaClient.Promotion;
			Reservation: PrismaClient.Reservation;
			FavoriteStore: PrismaClient.FavoriteStore;
			FavoriteProduct: PrismaClient.FavoriteProduct;
			FavoritePromotion: PrismaClient.FavoritePromotion;
			SearchLog: PrismaClient.SearchLog;
			DailyMallMetric: PrismaClient.DailyMallMetric;
			DailyPlatformMetric: PrismaClient.DailyPlatformMetric;
			AiRun: PrismaClient.AiRun;
			AdminCcAssignment: PrismaClient.AdminCcAssignment;
			ModerationReport: PrismaClient.ModerationReport;
			AuditEvent: PrismaClient.AuditEvent;
			Organization: PrismaClient.Organization;
			Member: PrismaClient.Member;
			Invitation: PrismaClient.Invitation;
	  }>;

export { accessibleBy };
