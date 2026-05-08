import { Delete02Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Badge,
	Button,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import type { Product } from '@/features/store-admin-local/shared/types/domain.models';

type ProductsTableProps = {
	products: Product[];
	search: string;
	onSearchChange: (value: string) => void;
	onEdit: (product: Product) => void;
	onDelete: (product: Product) => void;
};

export function ProductsTable({
	products,
	search,
	onSearchChange,
	onEdit,
	onDelete,
}: ProductsTableProps) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Input
					placeholder="Buscar por nombre o SKU…"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					className="max-w-sm"
				/>
			</div>
			<div className="rounded-xl border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Producto</TableHead>
							<TableHead>Variantes</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead className="w-24 text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => (
							<TableRow key={product.id}>
								<TableCell>
									<div className="flex flex-col">
										<span className="font-medium">{product.name}</span>
										<span className="text-xs text-muted-foreground">
											{product.basePriceCents} ¢ base
										</span>
									</div>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{product.variants.length} SKU
								</TableCell>
								<TableCell>
									<Badge
										variant={product.isPublished ? 'default' : 'secondary'}
									>
										{product.isPublished ? 'Publicado' : 'Borrador'}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={() => onEdit(product)}
											aria-label="Editar"
										>
											<HugeiconsIcon
												icon={PencilEdit02Icon}
												className="size-4"
											/>
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={() => onDelete(product)}
											aria-label="Eliminar"
										>
											<HugeiconsIcon icon={Delete02Icon} className="size-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
