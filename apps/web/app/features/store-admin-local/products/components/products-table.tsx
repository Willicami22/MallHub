import {
	Badge,
	Button,
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
		<div className="space-y-4">
			<div className="rounded-xl border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Producto</TableHead>
							<TableHead>Categoría</TableHead>
							<TableHead>Precio COP</TableHead>
							<TableHead>Variantes</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Stock</TableHead>
							<TableHead className="min-w-[18rem] text-right">
								Acciones
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => {
							const totalStock = product.variants.reduce(
								(sum, variant) => sum + variant.stock,
								0,
							);

							return (
								<TableRow key={product.id}>
									<TableCell>
										<span className="font-medium">{product.name}</span>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{product.category ?? '—'}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										<div className="flex flex-col">
											<span className="font-medium text-foreground">
												{formatCop(
													product.priceDiscountCents ?? product.basePriceCents,
												)}
											</span>
											{product.priceDiscountCents !== null ? (
												<span className="text-xs text-muted-foreground line-through">
													{formatCop(product.basePriceCents)} original
												</span>
											) : null}
										</div>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{product.variants.length} SKU
									</TableCell>
									<TableCell>
										<Badge variant={statusBadgeVariant[product.status]}>
											{statusLabel[product.status]}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												product.isReservable && totalStock > 0
													? 'default'
													: 'secondary'
											}
										>
											{product.isReservable && totalStock > 0
												? 'Disponible'
												: 'Sin stock'}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-wrap justify-end gap-1">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onEdit(product)}
												aria-label="Editar"
											>
												Editar
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onDuplicate(product)}
												aria-label="Duplicar"
											>
												Duplicar
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onToggleStatus(product)}
												aria-label="Cambiar estado"
											>
												{product.status === 'active' ? 'Desactivar' : 'Activar'}
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onToggleAvailability(product)}
												aria-label="Cambiar stock"
											>
												{product.isReservable && totalStock > 0
													? 'Sin stock'
													: 'Disponible'}
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onDelete(product)}
												aria-label="Eliminar"
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
