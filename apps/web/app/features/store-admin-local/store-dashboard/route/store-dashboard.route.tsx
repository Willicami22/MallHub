import { useOutletContext } from 'react-router';
import { StoreDashboard } from '@/features/store-admin-local/store-dashboard/components/store-dashboard';
import type { Route } from './+types/store-dashboard.route';

export const meta = () => [
	{ title: 'Dashboard' },
	{ name: 'description', content: 'Métricas y resumen de la tienda.' },
];

export default function StoreDashboardRoute(_props: Route.ComponentProps) {
	const { storeId } = useOutletContext<{ storeId: string }>();
	return <StoreDashboard storeId={storeId} />;
}
