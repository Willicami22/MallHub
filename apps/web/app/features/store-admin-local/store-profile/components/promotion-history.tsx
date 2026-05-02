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
	scheduled: 'Programada',
	active: 'Activa',
	expired: 'Expirada',
	cancelled: 'Cancelada',
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
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Campaña</TableHead>
							<TableHead>Descuento</TableHead>
							<TableHead>Ventana</TableHead>
							<TableHead>Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{promotions.map((promotion) => (
							<TableRow key={promotion.id}>
								<TableCell className="font-medium">{promotion.title}</TableCell>
								<TableCell>{promotion.discountPercent}%</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{new Date(promotion.startsAt).toLocaleDateString()} —{' '}
									{new Date(promotion.endsAt).toLocaleDateString()}
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
			</CardContent>
		</Card>
	);
}
