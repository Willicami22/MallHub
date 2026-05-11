import * as m from '@/paraglide/messages.js';

export type ModerationReportTargetType =
	| 'PRODUCT'
	| 'STORE_PROFILE'
	| 'MALL_PROFILE'
	| 'STORE_IMAGE'
	| 'MALL_IMAGE';

export const getModerationReportTargetLabel = (
	targetType: ModerationReportTargetType,
): string => {
	if (targetType === 'PRODUCT') {
		return m.admin_moderation_target_product();
	}

	if (targetType === 'STORE_PROFILE') {
		return m.admin_moderation_target_store_profile();
	}

	if (targetType === 'MALL_PROFILE') {
		return m.admin_moderation_target_mall_profile();
	}

	if (targetType === 'STORE_IMAGE') {
		return m.admin_moderation_target_store_image();
	}

	return m.admin_moderation_target_mall_image();
};
