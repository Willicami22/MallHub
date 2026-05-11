import { Spinner } from '@mallhub/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StoreConfigFormPanel } from '@/features/store-admin-local/store-config/components/store-config-form';
import { useTRPC } from '@/features/trpc/trpc.context';

export const meta = () => [
	{ title: 'Configuración de Tienda' },
	{ name: 'description', content: 'Configura los datos de tu tienda.' },
];

export default function StoreConfigRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const storeQuery = useQuery(trpc.storeAdminLocal.getMyStore.queryOptions());
	const store = storeQuery.data?.store ?? null;

	const handleSaved = () => {
		void queryClient.invalidateQueries({
			queryKey: trpc.storeAdminLocal.getMyStore.queryOptions().queryKey,
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Configuración de Tienda
				</h1>
				<p className="text-sm text-muted-foreground">
					Actualiza los datos de tu tienda.
				</p>
			</div>

			{storeQuery.isLoading && (
				<div className="flex justify-center p-12 text-muted-foreground">
					<Spinner />
				</div>
			)}

			{store && (
				<StoreConfigFormPanel
					key={store.id}
					store={store}
					onSaved={handleSaved}
				/>
			)}
		</div>
	);
}
