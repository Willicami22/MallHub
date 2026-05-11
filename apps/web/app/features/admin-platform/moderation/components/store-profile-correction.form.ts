import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const storeProfileCorrectionFormState = z.object({
	reason: z.string(),
	name: z.string(),
	category: z.string(),
	description: z.string(),
	contactEmail: z.string(),
	phone: z.string(),
});

const storeProfileCorrectionFormSchema = z.object({
	reason: z.string().trim().min(1, {
		error: m.admin_moderation_validation_reason_required(),
	}),
	name: z.string().trim().min(1, {
		error: m.admin_moderation_validation_store_name_required(),
	}),
	category: z.string().trim().max(120).nullable(),
	description: z.string().trim().max(1000).nullable(),
	contactEmail: z
		.string()
		.trim()
		.email({
			error: m.admin_moderation_validation_contact_email_invalid(),
		})
		.max(320)
		.nullable(),
	phone: z.string().trim().max(40).nullable(),
}) satisfies z.ZodType<{
	reason: string;
	name: string;
	category: string | null;
	description: string | null;
	contactEmail: string | null;
	phone: string | null;
}>;

const toNullable = (value: string): string | null => {
	const normalizedValue = value.trim();
	return normalizedValue.length > 0 ? normalizedValue : null;
};

const storeProfileCorrectionFormCodec = z.codec(
	storeProfileCorrectionFormState,
	storeProfileCorrectionFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim(),
			name: formState.name.trim(),
			category: toNullable(formState.category),
			description: toNullable(formState.description),
			contactEmail: toNullable(formState.contactEmail),
			phone: toNullable(formState.phone),
		}),
		encode: (formData) => ({
			reason: formData.reason,
			name: formData.name,
			category: formData.category ?? '',
			description: formData.description ?? '',
			contactEmail: formData.contactEmail ?? '',
			phone: formData.phone ?? '',
		}),
	},
);

type StoreProfileCorrectionFormState = z.infer<
	typeof storeProfileCorrectionFormState
>;
type StoreProfileCorrectionFormData = z.infer<
	typeof storeProfileCorrectionFormSchema
>;

const toStoreProfileCorrectionSubmitData = (
	formState: StoreProfileCorrectionFormState,
): StoreProfileCorrectionFormData | null => {
	const decodeResult = storeProfileCorrectionFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useStoreProfileCorrectionForm,
	withForm: withStoreProfileCorrectionForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

type StoreProfileCorrectionFormInitialValues = Partial<{
	reason: string;
	name: string;
	category: string | null;
	description: string | null;
	contactEmail: string | null;
	phone: string | null;
}>;

const getStoreProfileCorrectionFormDefaultValues = (
	initialValues?: StoreProfileCorrectionFormInitialValues,
): StoreProfileCorrectionFormState => ({
	reason: initialValues?.reason ?? '',
	name: initialValues?.name ?? '',
	category: initialValues?.category ?? '',
	description: initialValues?.description ?? '',
	contactEmail: initialValues?.contactEmail ?? '',
	phone: initialValues?.phone ?? '',
});

const STORE_PROFILE_CORRECTION_FORM_OPTIONS = formOptions({
	defaultValues: getStoreProfileCorrectionFormDefaultValues(),
	validators: {
		onSubmit: storeProfileCorrectionFormCodec,
	},
});

export type { StoreProfileCorrectionFormData, StoreProfileCorrectionFormState };
export {
	getStoreProfileCorrectionFormDefaultValues,
	STORE_PROFILE_CORRECTION_FORM_OPTIONS,
	storeProfileCorrectionFormCodec,
	toStoreProfileCorrectionSubmitData,
	useStoreProfileCorrectionForm,
	withStoreProfileCorrectionForm,
};
