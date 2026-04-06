type FieldErrorMessage = { message: string };
type UnknownRecord = Record<string, unknown>;

export type FormFieldErrorMap<TField extends string> = Partial<
	Record<TField, FieldErrorMessage>
>;

const isRecord = (value: unknown): value is UnknownRecord =>
	typeof value === 'object' && value !== null;

const isFieldErrorMessage = (value: unknown): value is FieldErrorMessage => {
	if (!isRecord(value)) {
		return false;
	}

	return typeof value.message === 'string';
};

const pickFieldErrors = <TField extends string>(
	zodError: unknown,
	fields: readonly TField[],
): FormFieldErrorMap<TField> => {
	const result: FormFieldErrorMap<TField> = {};

	if (!isRecord(zodError)) {
		return result;
	}

	for (const field of fields) {
		const candidate = zodError[field];
		if (isFieldErrorMessage(candidate)) {
			result[field] = { message: candidate.message };
		}
	}

	return result;
};

const hasFieldErrors = <TField extends string>(
	fieldErrors: FormFieldErrorMap<TField>,
): boolean => Object.keys(fieldErrors).length > 0;

export { hasFieldErrors, pickFieldErrors };
