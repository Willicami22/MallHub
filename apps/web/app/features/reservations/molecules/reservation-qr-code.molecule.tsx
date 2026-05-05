import { cn } from '@mallhub/ui';

function createSeed(value: string): number {
	let seed = 0;

	for (const character of value) {
		seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
	}

	return seed || 1;
}

function nextBit(state: { value: number }): number {
	let x = state.value;
	x ^= x << 13;
	x ^= x >>> 17;
	x ^= x << 5;
	state.value = x >>> 0;

	return state.value & 1;
}

function drawFinderPattern(matrix: number[][], startX: number, startY: number) {
	for (let y = 0; y < 7; y += 1) {
		for (let x = 0; x < 7; x += 1) {
			const isOuter = x === 0 || x === 6 || y === 0 || y === 6;
			const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
			matrix[startY + y][startX + x] = isOuter || isCenter ? 1 : 0;
		}
	}
}

function createVisualCodeMatrix(value: string, size = 21): boolean[][] {
	const matrix = Array.from({ length: size }, () =>
		Array.from({ length: size }, () => -1),
	);

	drawFinderPattern(matrix, 0, 0);
	drawFinderPattern(matrix, size - 7, 0);
	drawFinderPattern(matrix, 0, size - 7);

	const state = { value: createSeed(value) };

	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			if (matrix[y][x] !== -1) {
				continue;
			}

			matrix[y][x] = nextBit(state);
		}
	}

	return matrix.map((row) => row.map((cell) => cell === 1));
}

export function ReservationQrCodeMolecule({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	const matrix = createVisualCodeMatrix(value.toUpperCase());
	const cells = matrix.flatMap((row, rowIndex) =>
		row.map((isFilled, colIndex) => ({
			id: `cell-${rowIndex}-${colIndex}`,
			isFilled,
		})),
	);

	return (
		<div
			className={cn(
				'inline-grid rounded-lg border bg-background p-3',
				className,
			)}
			style={{
				gridTemplateColumns: `repeat(${matrix.length}, minmax(0, 1fr))`,
			}}
		>
			{cells.map((cell) => (
				<div
					key={cell.id}
					className={cn(
						'size-1.5',
						cell.isFilled ? 'bg-foreground' : 'bg-transparent',
					)}
				/>
			))}
		</div>
	);
}
