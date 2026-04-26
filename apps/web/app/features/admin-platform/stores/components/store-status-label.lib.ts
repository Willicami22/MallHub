import type { StoreStatus } from '@/features/.server/prisma/generated/client';
import * as m from '@/paraglide/messages.js';

export const getStoreStatusLabel = (status: StoreStatus): string => {
	if (status === 'ACTIVE') {
		return m.admin_stores_status_active();
	}

	if (status === 'SUSPENDED') {
		return m.admin_stores_status_suspended();
	}

	if (status === 'REJECTED') {
		return m.admin_stores_status_rejected();
	}

	if (status === 'PENDING_APPROVAL') {
		return m.admin_stores_status_pending_approval();
	}

	return m.admin_stores_status_draft();
};
