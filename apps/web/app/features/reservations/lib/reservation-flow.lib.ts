export type VariantGroup = {
	type: string;
	options: string[];
};

export type SelectedVariant = {
	type: string;
	option: string;
};

const OPEN_HOURS_PATTERN = /(\d{1,2}):(\d{2})[–\-–](\d{1,2}):(\d{2})/u;
const VARIANT_SNAPSHOT_PREFIX = '#variants:';

export function parseVariantGroups(
	variantsJson: string | null,
): VariantGroup[] {
	if (!variantsJson) {
		return [];
	}

	try {
		const parsed = JSON.parse(variantsJson);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.filter(
				(group): group is VariantGroup =>
					typeof group === 'object' &&
					typeof group.type === 'string' &&
					Array.isArray(group.options),
			)
			.map((group) => ({
				type: group.type.trim(),
				options: group.options
					.filter((option): option is string => typeof option === 'string')
					.map((option) => option.trim())
					.filter((option) => option.length > 0),
			}))
			.filter((group) => group.type.length > 0 && group.options.length > 0);
	} catch {
		return [];
	}
}

export function normalizeSelectedVariants(
	selectedVariants: SelectedVariant[],
): SelectedVariant[] {
	const byType = new Map<string, string>();

	for (const selectedVariant of selectedVariants) {
		const type = selectedVariant.type.trim();
		const option = selectedVariant.option.trim();

		if (type.length === 0 || option.length === 0) {
			continue;
		}

		byType.set(type, option);
	}

	return [...byType.entries()].map(([type, option]) => ({
		type,
		option,
	}));
}

export function toVariantSelectionMap(
	selectedVariants: SelectedVariant[],
): Record<string, string> {
	return Object.fromEntries(
		normalizeSelectedVariants(selectedVariants).map((selectedVariant) => [
			selectedVariant.type,
			selectedVariant.option,
		]),
	);
}

export function isVariantSelectionValid(
	groups: VariantGroup[],
	selectedVariants: SelectedVariant[],
): boolean {
	const selectionMap = toVariantSelectionMap(selectedVariants);
	const groupMap = new Map(groups.map((group) => [group.type, group]));

	if (groups.length === 0) {
		return Object.keys(selectionMap).length === 0;
	}

	for (const group of groups) {
		const selectedOption = selectionMap[group.type];

		if (!selectedOption || !group.options.includes(selectedOption)) {
			return false;
		}
	}

	for (const [type, option] of Object.entries(selectionMap)) {
		const group = groupMap.get(type);
		if (!group?.options.includes(option)) {
			return false;
		}
	}

	return true;
}

export function parseQuantityParam(
	rawQuantity: string | null,
	maxStock?: number,
): number {
	const parsedQuantity = Number.parseInt(rawQuantity ?? '1', 10);
	const safeQuantity = Number.isInteger(parsedQuantity) ? parsedQuantity : 1;
	const normalizedQuantity = Math.max(1, safeQuantity);

	if (typeof maxStock !== 'number' || maxStock < 1) {
		return normalizedQuantity;
	}

	return Math.min(normalizedQuantity, maxStock);
}

export function encodeSelectedVariantsParam(
	selectedVariants: SelectedVariant[],
): string {
	return JSON.stringify(normalizeSelectedVariants(selectedVariants));
}

export function decodeSelectedVariantsParam(
	rawSelectedVariants: string | null,
): SelectedVariant[] {
	if (!rawSelectedVariants) {
		return [];
	}

	try {
		const parsed = JSON.parse(rawSelectedVariants);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return normalizeSelectedVariants(
			parsed
				.filter(
					(item): item is SelectedVariant =>
						typeof item === 'object' &&
						typeof item.type === 'string' &&
						typeof item.option === 'string',
				)
				.map((item) => ({
					type: item.type,
					option: item.option,
				})),
		);
	} catch {
		return [];
	}
}

export function parseOpenHoursRange(
	openHours: string | null,
): { opensAtMinutes: number; closesAtMinutes: number } | null {
	if (!openHours) {
		return null;
	}

	const match = openHours.match(OPEN_HOURS_PATTERN);
	if (!match) {
		return null;
	}

	const [, opensHour, opensMinute, closesHour, closesMinute] =
		match.map(Number);

	return {
		opensAtMinutes: opensHour * 60 + opensMinute,
		closesAtMinutes: closesHour * 60 + closesMinute,
	};
}

export function isStoreOpenNow(
	openHours: string | null,
	nowDate: Date = new Date(),
): boolean {
	const range = parseOpenHoursRange(openHours);

	if (!range) {
		return false;
	}

	const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
	return (
		nowMinutes >= range.opensAtMinutes && nowMinutes < range.closesAtMinutes
	);
}

export function buildProductReservationStepOnePath(productId: string): string {
	return `/products/${productId}/reserve`;
}

export function buildProductReservationStepTwoPath(productId: string): string {
	return `/products/${productId}/reserve/contact`;
}

export function buildProductReservationStepThreePath({
	productId,
	reservationId,
}: {
	productId: string;
	reservationId: string;
}): string {
	return `/products/${productId}/reserve/confirmation/${reservationId}`;
}

export function buildVariantSnapshot(
	selectedVariants: SelectedVariant[],
): string | null {
	const normalizedSelectedVariants =
		normalizeSelectedVariants(selectedVariants);

	if (normalizedSelectedVariants.length === 0) {
		return null;
	}

	return `${VARIANT_SNAPSHOT_PREFIX}${JSON.stringify(normalizedSelectedVariants)}`;
}

export function extractSelectedVariantsFromPickupNote(
	pickupNote: string | null,
): SelectedVariant[] {
	if (!pickupNote) {
		return [];
	}

	const snapshotLine = pickupNote
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.startsWith(VARIANT_SNAPSHOT_PREFIX));

	if (!snapshotLine) {
		return [];
	}

	return decodeSelectedVariantsParam(
		snapshotLine.slice(VARIANT_SNAPSHOT_PREFIX.length),
	);
}
