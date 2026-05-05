import {
	Cancel01Icon,
	CheckmarkBadge01Icon,
	MoreHorizontalIcon,
	Time01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	toast,
} from '@mallhub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTRPC } from '@/features/trpc/trpc.context';
import type { Route } from './+types/admin-cc-stores.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: 'Tiendas | Admin CC' }];
}

export default function AdminCcStoresRoute() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: stores, isLoading } = useQuery(
		trpc.adminCc.stores.getStores.queryOptions(),
	);

	const updateStatusMutation = useMutation(
		trpc.adminCc.stores.updateStatus.mutationOptions({
			onSuccess: (_data) => {
				toast('Tienda actualizada correctamente.');
				queryClient.invalidateQueries({
					queryKey: trpc.adminCc.stores.getStores.queryKey(),
				});
			},
			onError: () => {
				toast.error('Error al actualizar el estado.');
			},
		}),
	);

	const handleStatusChange = (
		storeId: string,
		status: 'APPROVED' | 'REJECTED',
	) => {
		updateStatusMutation.mutate({ storeId, status });
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'APPROVED':
				return (
					<Badge
						variant="default"
						className="bg-emerald-500 hover:bg-emerald-600"
					>
						Aprobada
					</Badge>
				);
			case 'REJECTED':
				return <Badge variant="destructive">Rechazada</Badge>;
			default:
				return (
					<Badge
						variant="secondary"
						className="bg-amber-500 hover:bg-amber-600 text-white"
					>
						Pendiente
					</Badge>
				);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Gestión de Tiendas
				</h1>
				<p className="text-muted-foreground">
					Revisa las solicitudes y administra tiendas (US-ACC-02).
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Directorio de Tiendas</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nombre</TableHead>
									<TableHead>Categoría</TableHead>
									<TableHead>Contacto</TableHead>
									<TableHead>Solicitud</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="w-[80px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6} className="h-24 text-center">
											Cargando...
										</TableCell>
									</TableRow>
								) : (
									stores?.map((store) => (
										<TableRow key={store.id}>
											<TableCell className="font-medium">
												{store.name}
											</TableCell>
											<TableCell>{store.category}</TableCell>
											<TableCell>{store.contactEmail}</TableCell>
											<TableCell>
												<span className="flex items-center text-muted-foreground">
													<HugeiconsIcon
														icon={Time01Icon}
														className="mr-2 size-4"
													/>
													{formatDistanceToNow(new Date(store.requestedAt), {
														addSuffix: true,
														locale: es,
													})}
												</span>
											</TableCell>
											<TableCell>{getStatusBadge(store.status)}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<HugeiconsIcon
																icon={MoreHorizontalIcon}
																className="size-4"
															/>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() =>
																handleStatusChange(store.id, 'APPROVED')
															}
															disabled={
																store.status === 'APPROVED' ||
																updateStatusMutation.isPending
															}
														>
															<HugeiconsIcon
																icon={CheckmarkBadge01Icon}
																className="mr-2 size-4 text-emerald-500"
															/>
															Aprobar
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusChange(store.id, 'REJECTED')
															}
															disabled={
																store.status === 'REJECTED' ||
																updateStatusMutation.isPending
															}
														>
															<HugeiconsIcon
																icon={Cancel01Icon}
																className="mr-2 size-4 text-red-500"
															/>
															Rechazar
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
