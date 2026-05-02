import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	Skeleton,
} from '@mallhub/ui';
import type { ReactNode } from 'react';

type ResourceBoundaryProps = {
	isLoading: boolean;
	isError: boolean;
	errorMessage?: string | null;
	isEmpty: boolean;
	onRetry?: () => void;
	loadingFallback: ReactNode;
	empty: ReactNode;
	children: ReactNode;
};

/**
 * Standard loading / error / empty / success shell for feature routes.
 * Keeps route components thin: they pass query flags + slot content.
 */
export function ResourceBoundary({
	isLoading,
	isError,
	errorMessage,
	isEmpty,
	onRetry,
	loadingFallback,
	empty,
	children,
}: ResourceBoundaryProps) {
	if (isLoading) {
		return loadingFallback;
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
				<AlertTitle>No se pudo cargar el recurso</AlertTitle>
				<AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<span>{errorMessage ?? 'Intenta de nuevo en unos segundos.'}</span>
					{onRetry ? (
						<Button type="button" variant="outline" size="sm" onClick={onRetry}>
							Reintentar
						</Button>
					) : null}
				</AlertDescription>
			</Alert>
		);
	}

	if (isEmpty) {
		return empty;
	}

	return children;
}

export function TableSkeletonRows({ rows = 5 }: { rows?: number }) {
	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: rows }, (_, index) => (
				<Skeleton key={`row-${String(index)}`} className="h-10 w-full" />
			))}
		</div>
	);
}

export function MetricCardsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: 4 }, (_, index) => (
				<div
					key={`metric-${String(index)}`}
					className="flex flex-col gap-3 rounded-xl border p-4"
				>
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-3 w-32" />
				</div>
			))}
		</div>
	);
}

export function ListEmptyState(props: {
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon" />
				<EmptyTitle>{props.title}</EmptyTitle>
				<EmptyDescription>{props.description}</EmptyDescription>
			</EmptyHeader>
			{props.action}
		</Empty>
	);
}
