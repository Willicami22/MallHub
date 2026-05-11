import type {
	CampaignBannerType,
	CampaignStatus,
} from '@/features/.server/prisma/generated/client';
import * as m from '@/paraglide/messages.js';

export const getCampaignStatusLabel = (status: CampaignStatus): string => {
	if (status === 'ACTIVE') {
		return m.admin_campaigns_status_active();
	}

	if (status === 'PAUSED') {
		return m.admin_campaigns_status_paused();
	}

	if (status === 'EXPIRED') {
		return m.admin_campaigns_status_expired();
	}

	return m.admin_campaigns_status_draft();
};

export const getCampaignBannerTypeLabel = (
	bannerType: CampaignBannerType,
): string =>
	bannerType === 'NATIVE_CARD'
		? m.admin_campaigns_banner_type_native_card()
		: m.admin_campaigns_banner_type_image();

export const formatCampaignDate = (value: string | Date | null): string => {
	if (!value) {
		return m.admin_campaigns_date_not_available();
	}

	return new Date(value).toLocaleDateString();
};

export const formatCampaignCtr = (value: number): string =>
	`${(value * 100).toFixed(2)}%`;
