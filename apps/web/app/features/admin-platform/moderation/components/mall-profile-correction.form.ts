import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const mallProfileCorrectionFormState = z.object({
	reason: z.string(),
	name: z.string(),
	city: z.string(),
	address: z.string(),
	description: z.string(),
});

const mallProfileCorrectionFormSchema = z.object({
	reason: z.string().trim().min(1, {
		error: m.admin_moderation_validation_reason_required(),
	}),
	name: z.string().trim().min(1, {
		error: m.admin_moderation_validation_mall_name_required(),
	}),
	city: z.string().trim().min(1, {
		error: m.admin_moderation_validation_mall_city_required(),
	}),
	address: z.string().trim().min(1, {
		error: m.admin_moderation_validation_mall_address_required(),
	}),
	description: z.string().trim().max(1000).nullable(),
}) satisfies z.ZodType<{
	reason: string;
	name: string;
	city: string;
	address: string;
	description: string | null;
}>;

const mallProfileCorrectionFormCodec = z.codec(
	mallProfileCorrectionFormState,
	mallProfileCorrectionFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim(),
			name: formState.name.trim(),
			city: formState.city.trim(),
			address: formState.address.trim(),
			description: formState.description.trim().length
				? formState.description.trim()
				: null,
		}),
		encode: (formData) => ({
			reason: formData.reason,
			name: formData.name,
			city: formData.city,
			address: formData.address,
			description: formData.description ?? '',
		}),
	},
);

type MallProfileCorrectionFormState = z.infer<
	typeof mallProfileCorrectionFormState
>;
type MallProfileCorrectionFormData = z.infer<
	typeof mallProfileCorrectionFormSchema
>;

const toMallProfileCorrectionSubmitData = (
	formState: MallProfileCorrectionFormState,
): MallProfileCorrectionFormData | null => {
	const decodeResult = mallProfileCorrectionFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useMallProfileCorrectionForm,
	withForm: withMallProfileCorrectionForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

type MallProfileCorrectionFormInitialValues = Partial<{
	reason: string;
	name: string;
	city: string;
	address: string;
	description: string | null;
}>;

const getMallProfileCorrectionFormDefaultValues = (
	initialValues?: MallProfileCorrectionFormInitialValues,
): MallProfileCorrectionFormState => ({
	reason: initialValues?.reason ?? '',
	name: initialValues?.name ?? '',
	city: initialValues?.city ?? '',
	address: initialValues?.address ?? '',
	description: initialValues?.description ?? '',
});

const MALL_PROFILE_CORRECTION_FORM_OPTIONS = formOptions({
	defaultValues: getMallProfileCorrectionFormDefaultValues(),
	validators: {
		onSubmit: mallProfileCorrectionFormCodec,
	},
});

export type { MallProfileCorrectionFormData, MallProfileCorrectionFormState };
export {
	getMallProfileCorrectionFormDefaultValues,
	MALL_PROFILE_CORRECTION_FORM_OPTIONS,
	mallProfileCorrectionFormCodec,
	toMallProfileCorrectionSubmitData,
	useMallProfileCorrectionForm,
	withMallProfileCorrectionForm,
};
