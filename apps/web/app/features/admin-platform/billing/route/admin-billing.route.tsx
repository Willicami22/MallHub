import { AdminSectionPlaceholder } from '@/features/admin-platform/components/admin-section-placeholder';
import * as m from '@/paraglide/messages.js';

export default function AdminBillingRoute() {
	return <AdminSectionPlaceholder sectionName={m.admin_nav_billing()} />;
}
