import type { MallStatus } from '@/features/.server/prisma/generated/client';
import * as m from '@/paraglide/messages.js';

export const getMallStatusLabel = (status: MallStatus): string => {
	if (status === 'ACTIVE') {
		return m.admin_malls_status_active();
	}

	if (status === 'SUSPENDED') {
		return m.admin_malls_status_suspended();
	}

	return m.admin_malls_status_inactive();
};
