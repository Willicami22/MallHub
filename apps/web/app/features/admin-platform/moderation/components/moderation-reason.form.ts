import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const moderationReasonFormState = z.object({
	reason: z.string(),
});

const moderationReasonFormSchema = z.object({
	reason: z.string().trim().min(1, {
		error: m.admin_moderation_validation_reason_required(),
	}),
}) satisfies z.ZodType<{
	reason: string;
}>;

const moderationReasonFormCodec = z.codec(
	moderationReasonFormState,
	moderationReasonFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim(),
		}),
		encode: (formData) => ({
			reason: formData.reason,
		}),
	},
);

type ModerationReasonFormState = z.infer<typeof moderationReasonFormState>;
type ModerationReasonFormData = z.infer<typeof moderationReasonFormSchema>;

const toModerationReasonSubmitData = (
	formState: ModerationReasonFormState,
): ModerationReasonFormData | null => {
	const decodeResult = moderationReasonFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useModerationReasonForm,
	withForm: withModerationReasonForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const MODERATION_REASON_FORM_OPTIONS = formOptions({
	defaultValues: {
		reason: '',
	} satisfies ModerationReasonFormState,
	validators: {
		onSubmit: moderationReasonFormCodec,
	},
});

export type { ModerationReasonFormData, ModerationReasonFormState };
export {
	MODERATION_REASON_FORM_OPTIONS,
	moderationReasonFormCodec,
	toModerationReasonSubmitData,
	useModerationReasonForm,
	withModerationReasonForm,
};
