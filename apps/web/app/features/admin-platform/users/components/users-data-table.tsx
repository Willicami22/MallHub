import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@mallhub/ui';
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import * as m from '@/paraglide/messages.js';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageCount: number;
	pageIndex: number;
	pageSize: number;
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	onSortingChange: (sorting: SortingState) => void;
	onColumnFiltersChange: (filters: ColumnFiltersState) => void;
	isLoading?: boolean;
}

export function UsersDataTable<TData, TValue>({
	columns,
	data,
	pageCount,
	pageIndex,
	pageSize,
	sorting,
	columnFilters,
	onSortingChange,
	onColumnFiltersChange,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		pageCount,
		state: {
			sorting,
			columnFilters,
			pagination: { pageIndex, pageSize },
		},
		onSortingChange: (updater) => {
			const next = typeof updater === 'function' ? updater(sorting) : updater;
			onSortingChange(next);
		},
		onColumnFiltersChange: (updater) => {
			const next =
				typeof updater === 'function' ? updater(columnFilters) : updater;
			onColumnFiltersChange(next);
		},
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
	});

	return (
		<div className="w-full">
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: pageSize }).map((_, i) => (
								<TableRow key={`skeleton-${i.toString()}`}>
									{columns.map((_, j) => (
										<TableCell key={`skeleton-cell-${j.toString()}`}>
											<div className="h-4 w-24 animate-pulse rounded bg-muted" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									{m.admin_users_no_results()}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
