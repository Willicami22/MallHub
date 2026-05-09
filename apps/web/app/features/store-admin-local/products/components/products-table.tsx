import {
	Badge,
	Button,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import { formatCop } from '@/features/shared/lib/format-cop.lib';
import type { Product } from '@/features/store-admin-local/shared/types/domain.models';

type ProductsTableProps = {
	products: Product[];
	onEdit: (product: Product) => void;
	onDuplicate: (product: Product) => void;
	onToggleStatus: (product: Product) => void;
	onToggleAvailability: (product: Product) => void;
	onDelete: (product: Product) => void;
};

const statusLabel: Record<Product['status'], string> = {
	draft: 'Borrador',
	active: 'Activo',
	inactive: 'Inactivo',
	archived: 'Archivado',
};

const statusBadgeVariant: Record<
	Product['status'],
	'default' | 'secondary' | 'outline' | 'destructive'
> = {
	draft: 'secondary',
	active: 'default',
	inactive: 'outline',
	archived: 'destructive',
};

export function ProductsTable({
	products,
	onEdit,
	onDuplicate,
	onToggleStatus,
	onToggleAvailability,
	onDelete,
}: ProductsTableProps) {
	return (
		<div className="overflow-hidden rounded-xl border">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Producto</TableHead>
							<TableHead className="hidden sm:table-cell">Categoría</TableHead>
							<TableHead>Precio COP</TableHead>
							<TableHead className="hidden md:table-cell">Variantes</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>
								<span className="whitespace-nowrap">
									Disponible para reserva
								</span>
							</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => {
							const totalStock = product.variants.reduce(
								(sum, variant) => sum + variant.stock,
								0,
							);
							const isAvailable = product.isReservable && totalStock > 0;

							return (
								<TableRow key={product.id}>
									<TableCell>
										<div className="flex min-w-0 items-center gap-2">
											{product.images[0] ? (
												<img
													src={product.images[0]}
													alt={product.name}
													className="h-9 w-9 shrink-0 rounded-md border object-cover"
												/>
											) : (
												<div className="h-9 w-9 shrink-0 rounded-md border bg-muted" />
											)}
											<span className="truncate font-medium">
												{product.name}
											</span>
										</div>
									</TableCell>
									<TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
										{product.category ?? '—'}
									</TableCell>
									<TableCell className="text-sm">
										<div className="flex flex-col">
											<span className="font-medium text-foreground">
												{formatCop(
													product.priceDiscountCents ?? product.basePriceCents,
												)}
											</span>
											{product.priceDiscountCents !== null ? (
												<span className="text-xs text-muted-foreground line-through">
													{formatCop(product.basePriceCents)}
												</span>
											) : null}
										</div>
									</TableCell>
									<TableCell className="hidden text-sm text-muted-foreground md:table-cell">
										{product.variants.length} SKU · stock {totalStock}
									</TableCell>
									<TableCell>
										<Badge variant={statusBadgeVariant[product.status]}>
											{statusLabel[product.status]}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Switch
												checked={isAvailable}
												onCheckedChange={() => onToggleAvailability(product)}
												aria-label={
													isAvailable
														? 'Marcar como sin stock'
														: 'Marcar como disponible'
												}
											/>
											<span
												className={`whitespace-nowrap text-xs font-medium ${isAvailable ? 'text-foreground' : 'text-muted-foreground'}`}
											>
												{isAvailable ? 'Disponible' : 'Sin stock'}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-wrap justify-end gap-1">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onEdit(product)}
											>
												Editar
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onDuplicate(product)}
											>
												Duplicar
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onToggleStatus(product)}
											>
												{product.status === 'active' ? 'Desactivar' : 'Activar'}
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="text-destructive hover:text-destructive"
												onClick={() => onDelete(product)}
											>
												Eliminar
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
