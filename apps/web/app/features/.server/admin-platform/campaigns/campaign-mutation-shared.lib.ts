import { TRPCError } from '@trpc/server';
import { prisma } from '@/features/.server/prisma/prisma.server';
import type { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import * as m from '@/paraglide/messages.js';
import { parseIsoDateInput } from './campaign-date-input.lib';

type Locale = ReturnType<typeof getLocaleFromAsyncStorage>;

export const normalizeTargetMallIds = (targetMallIds: string[]): string[] =>
	Array.from(
		new Set(
			targetMallIds
				.map((mallId) => mallId.trim())
				.filter((mallId) => mallId.length > 0),
		),
	);

export const parseCampaignSchedule = (
	startsAtInput: string,
	endsAtInput: string,
	locale: Locale,
): { startsAt: Date; endsAt: Date } => {
	const startsAt = parseIsoDateInput(startsAtInput, 'start');
	const endsAt = parseIsoDateInput(endsAtInput, 'end');

	if (!startsAt || !endsAt) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: m.admin_campaigns_validation_date_invalid({}, { locale }),
		});
	}

	if (endsAt.getTime() < startsAt.getTime()) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: m.admin_campaigns_validation_end_before_start({}, { locale }),
		});
	}

	return { startsAt, endsAt };
};

export const ensureTargetMallsExist = async (
	targetMallIds: string[],
	locale: Locale,
): Promise<string[]> => {
	const normalizedTargetMallIds = normalizeTargetMallIds(targetMallIds);
	if (!normalizedTargetMallIds.length) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: m.admin_campaigns_validation_target_mall_required(
				{},
				{ locale },
			),
		});
	}

	const foundMalls = await prisma.mall.findMany({
		where: {
			id: {
				in: normalizedTargetMallIds,
			},
		},
		select: {
			id: true,
		},
	});
	if (foundMalls.length !== normalizedTargetMallIds.length) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: m.admin_campaigns_validation_target_mall_invalid({}, { locale }),
		});
	}

	return normalizedTargetMallIds;
};
