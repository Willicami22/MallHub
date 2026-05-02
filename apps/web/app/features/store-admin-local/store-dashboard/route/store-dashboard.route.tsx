import { useAuth } from '@/features/store-admin-local/auth/hooks/use-auth';
import { StoreDashboard } from '@/features/store-admin-local/store-dashboard/components/store-dashboard';
import type { Route } from './+types/store-dashboard.route';

export const meta = () => [
	{ title: 'Dashboard' },
	{ name: 'description', content: 'Métricas y resumen de la tienda.' },
];

export default function StoreDashboardRoute(_props: Route.ComponentProps) {
	const { activeStoreId } = useAuth();
	return <StoreDashboard storeId={activeStoreId} />;
}
