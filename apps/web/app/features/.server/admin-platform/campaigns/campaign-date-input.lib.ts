export const ISO_DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const parseIsoDateInput = (
	input: string | undefined,
	boundary: 'start' | 'end' = 'start',
): Date | undefined => {
	if (!input) {
		return undefined;
	}

	const date = new Date(
		`${input}T${boundary === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`,
	);
	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date;
};
