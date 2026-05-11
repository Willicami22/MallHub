import * as m from '@/paraglide/messages.js';

export type ModerationReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export const getModerationReportStatusLabel = (
	status: ModerationReportStatus,
): string => {
	if (status === 'OPEN') {
		return m.admin_moderation_status_open();
	}

	if (status === 'RESOLVED') {
		return m.admin_moderation_status_resolved();
	}

	return m.admin_moderation_status_dismissed();
};
