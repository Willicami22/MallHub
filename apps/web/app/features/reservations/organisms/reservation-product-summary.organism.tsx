import {
	Building04Icon,
	Clock01Icon,
	Location01Icon,
	ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@mallhub/ui';

function formatPrice(value: number): string {
	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
}

export function ReservationProductSummaryOrganism({
	product,
	priceLabel,
	floorLabel,
	hoursLabel,
}: {
	product: {
		name: string;
		priceOriginal: number;
		priceDiscount: number | null;
		storeName: string;
		storeFloor: string | null;
		storeOpenHours: string | null;
	};
	priceLabel: string;
	floorLabel: string;
	hoursLabel: string;
}) {
	const price = product.priceDiscount ?? product.priceOriginal;

	return (
		<Card className="overflow-hidden">
			<div className="flex h-44 w-full items-center justify-center bg-muted">
				<HugeiconsIcon
					icon={ShoppingBag01Icon}
					className="size-16 text-muted-foreground/20"
				/>
			</div>
			<CardContent className="space-y-4 p-5">
				<div>
					<h2 className="text-lg font-semibold text-foreground">
						{product.name}
					</h2>
					<div className="mt-1 text-sm text-muted-foreground">
						{priceLabel}: {formatPrice(price)}
					</div>
				</div>
				<div className="space-y-1.5 text-sm text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<HugeiconsIcon icon={Building04Icon} className="size-4 shrink-0" />
						<span>{product.storeName}</span>
					</div>
					{product.storeFloor && (
						<div className="flex items-center gap-1.5">
							<HugeiconsIcon
								icon={Location01Icon}
								className="size-4 shrink-0"
							/>
							<span>{`${floorLabel}: ${product.storeFloor}`}</span>
						</div>
					)}
					{product.storeOpenHours && (
						<div className="flex items-center gap-1.5">
							<HugeiconsIcon icon={Clock01Icon} className="size-4 shrink-0" />
							<span>{`${hoursLabel}: ${product.storeOpenHours}`}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
