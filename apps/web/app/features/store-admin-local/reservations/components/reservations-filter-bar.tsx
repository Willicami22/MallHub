import { FilterResetIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@mallhub/ui';

export type ReservationsFilters = {
	status: string[];
	dateFrom: string;
	dateTo: string;
};

type ReservationsFilterBarProps = {
	filters: ReservationsFilters;
	onChange: (filters: ReservationsFilters) => void;
};

export function ReservationsFilterBar({
	filters,
	onChange,
}: ReservationsFilterBarProps) {
	const handleStatusChange = (value: string | null) => {
		if (!value) return;
		if (value === 'all') {
			onChange({ ...filters, status: [] });
		} else {
			onChange({ ...filters, status: [value] });
		}
	};

	const hasActiveFilters =
		filters.status.length > 0 || filters.dateFrom || filters.dateTo;

	const clearFilters = () => {
		onChange({ status: [], dateFrom: '', dateTo: '' });
	};

	return (
		<div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-end">
			<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
				<div className="space-y-1 sm:w-48">
					<Label htmlFor="status-filter" className="text-xs">
						Estado
					</Label>
					<Select
						value={filters.status[0] ?? 'all'}
						onValueChange={(val) => handleStatusChange(val)}
					>
						<SelectTrigger id="status-filter">
							<SelectValue placeholder="Todos" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							<SelectItem value="pending">Pendiente</SelectItem>
							<SelectItem value="confirmed">Confirmada</SelectItem>
							<SelectItem value="completed">Completada</SelectItem>
							<SelectItem value="rejected">Rechazada / Cancelada</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1 sm:w-40">
					<Label htmlFor="date-from" className="text-xs">
						Desde
					</Label>
					<Input
						id="date-from"
						type="date"
						value={filters.dateFrom}
						onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
					/>
				</div>

				<div className="space-y-1 sm:w-40">
					<Label htmlFor="date-to" className="text-xs">
						Hasta
					</Label>
					<Input
						id="date-to"
						type="date"
						value={filters.dateTo}
						onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
					/>
				</div>
			</div>

			{hasActiveFilters && (
				<Button variant="ghost" size="sm" onClick={clearFilters}>
					<HugeiconsIcon icon={FilterResetIcon} className="size-4" />
					Limpiar
				</Button>
			)}
		</div>
	);
}
