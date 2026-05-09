import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import type { Promotion } from '@/features/store-admin-local/shared/types/domain.models';

const promoStatus: Record<Promotion['status'], string> = {
	draft: 'Borrador',
	active: 'Activa',
	inactive: 'Inactiva',
	expired: 'Expirada',
};

type PromotionHistoryProps = {
	promotions: Promotion[];
};

export function PromotionHistory({ promotions }: PromotionHistoryProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Historial de promociones</CardTitle>
			</CardHeader>
			<CardContent className="px-0 pb-0">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Campaña</TableHead>
								<TableHead>Descuento</TableHead>
								<TableHead>Ventana</TableHead>
								<TableHead className="text-right">Vistas</TableHead>
								<TableHead className="text-right">Clics</TableHead>
								<TableHead>Estado</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{promotions.map((promotion) => (
								<TableRow key={promotion.id}>
									<TableCell className="font-medium">
										{promotion.title}
									</TableCell>
									<TableCell>{promotion.discountPercent}%</TableCell>
									<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
										{promotion.startsAt
											? new Date(promotion.startsAt).toLocaleDateString()
											: 'N/A'}{' '}
										—{' '}
										{promotion.endsAt
											? new Date(promotion.endsAt).toLocaleDateString()
											: 'N/A'}
									</TableCell>
									<TableCell className="text-right">
										{promotion.viewsCount}
									</TableCell>
									<TableCell className="text-right">
										{promotion.clicksCount}
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{promoStatus[promotion.status]}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
