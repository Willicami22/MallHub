import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';

export const { fieldContext, formContext } = createFormHookContexts();

const sendCollectionAlertFormState = z.object({
	reason: z.string(),
});

const sendCollectionAlertFormSchema = z.object({
	reason: z.string().trim().max(500).nullable(),
}) satisfies z.ZodType<{
	reason: string | null;
}>;

const sendCollectionAlertFormCodec = z.codec(
	sendCollectionAlertFormState,
	sendCollectionAlertFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim().length ? formState.reason.trim() : null,
		}),
		encode: (formData) => ({
			reason: formData.reason ?? '',
		}),
	},
);

type SendCollectionAlertFormState = z.infer<
	typeof sendCollectionAlertFormState
>;
type SendCollectionAlertFormData = z.infer<
	typeof sendCollectionAlertFormSchema
>;

const toSendCollectionAlertSubmitData = (
	formState: SendCollectionAlertFormState,
): SendCollectionAlertFormData | null => {
	const decodeResult = sendCollectionAlertFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useSendCollectionAlertForm,
	withForm: withSendCollectionAlertForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const SEND_COLLECTION_ALERT_FORM_OPTIONS = formOptions({
	defaultValues: {
		reason: '',
	} satisfies SendCollectionAlertFormState,
	validators: {
		onSubmit: sendCollectionAlertFormCodec,
	},
});

export type { SendCollectionAlertFormData, SendCollectionAlertFormState };
export {
	SEND_COLLECTION_ALERT_FORM_OPTIONS,
	sendCollectionAlertFormCodec,
	toSendCollectionAlertSubmitData,
	useSendCollectionAlertForm,
	withSendCollectionAlertForm,
};
