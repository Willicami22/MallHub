import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import type { CampaignStatus } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';

const EXPIRABLE_STATUSES: CampaignStatus[] = ['ACTIVE', 'PAUSED'];

export const syncExpiredCampaigns = async (): Promise<number> => {
	const now = new Date();
	const dueCampaigns = await prisma.campaign.findMany({
		where: {
			status: {
				in: EXPIRABLE_STATUSES,
			},
			endsAt: {
				lt: now,
			},
		},
		select: {
			id: true,
			name: true,
			status: true,
			endsAt: true,
		},
	});

	if (!dueCampaigns.length) {
		return 0;
	}

	const dueCampaignIds = dueCampaigns.map((campaign) => campaign.id);
	await prisma.campaign.updateMany({
		where: {
			id: {
				in: dueCampaignIds,
			},
			status: {
				in: EXPIRABLE_STATUSES,
			},
			endsAt: {
				lt: now,
			},
		},
		data: {
			status: 'EXPIRED',
			expiredAt: now,
			updatedByUserId: null,
		},
	});

	await Promise.all(
		dueCampaigns.map((campaign) =>
			writeAuditEventBestEffort({
				context: 'campaigns.syncExpiredCampaigns',
				action: auditEventActions.ADMIN_CAMPAIGN_AUTO_EXPIRED,
				targetType: 'Campaign',
				targetId: campaign.id,
				metadata: {
					name: campaign.name,
					previousStatus: campaign.status,
					endsAt: campaign.endsAt.toISOString(),
					expiredAt: now.toISOString(),
				},
			}),
		),
	);

	return dueCampaigns.length;
};
