import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const rejectStoreRegistrationFormState = z.object({
	reason: z.string(),
});

const rejectStoreRegistrationFormSchema = z.object({
	reason: z.string().trim().min(1, {
		error: m.admin_store_registrations_validation_reject_reason_required(),
	}),
}) satisfies z.ZodType<{
	reason: string;
}>;

const rejectStoreRegistrationFormCodec = z.codec(
	rejectStoreRegistrationFormState,
	rejectStoreRegistrationFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim(),
		}),
		encode: (formData) => ({
			reason: formData.reason,
		}),
	},
);

type RejectStoreRegistrationFormState = z.infer<
	typeof rejectStoreRegistrationFormState
>;
type RejectStoreRegistrationFormData = z.infer<
	typeof rejectStoreRegistrationFormSchema
>;

const toRejectStoreRegistrationSubmitData = (
	formState: RejectStoreRegistrationFormState,
): RejectStoreRegistrationFormData | null => {
	const decodeResult = rejectStoreRegistrationFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useRejectStoreRegistrationForm,
	withForm: withRejectStoreRegistrationForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const REJECT_STORE_REGISTRATION_FORM_OPTIONS = formOptions({
	defaultValues: {
		reason: '',
	} satisfies RejectStoreRegistrationFormState,
	validators: {
		onSubmit: rejectStoreRegistrationFormCodec,
	},
});

export type {
	RejectStoreRegistrationFormData,
	RejectStoreRegistrationFormState,
};
export {
	REJECT_STORE_REGISTRATION_FORM_OPTIONS,
	rejectStoreRegistrationFormCodec,
	toRejectStoreRegistrationSubmitData,
	useRejectStoreRegistrationForm,
	withRejectStoreRegistrationForm,
};
