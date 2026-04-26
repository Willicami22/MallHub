import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const suspendMallFormState = z.object({
	reason: z.string(),
});

const suspendMallFormSchema = z.object({
	reason: z.string().trim().min(1, {
		error: m.admin_malls_validation_suspend_reason_required(),
	}),
}) satisfies z.ZodType<{
	reason: string;
}>;

const suspendMallFormCodec = z.codec(
	suspendMallFormState,
	suspendMallFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim(),
		}),
		encode: (formData) => ({
			reason: formData.reason,
		}),
	},
);

type SuspendMallFormState = z.infer<typeof suspendMallFormState>;
type SuspendMallFormData = z.infer<typeof suspendMallFormSchema>;

const toSuspendMallSubmitData = (
	formState: SuspendMallFormState,
): SuspendMallFormData | null => {
	const decodeResult = suspendMallFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useSuspendMallForm, withForm: withSuspendMallForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const SUSPEND_MALL_FORM_OPTIONS = formOptions({
	defaultValues: {
		reason: '',
	} satisfies SuspendMallFormState,
	validators: {
		onSubmit: suspendMallFormCodec,
	},
});

export type { SuspendMallFormData, SuspendMallFormState };
export {
	SUSPEND_MALL_FORM_OPTIONS,
	suspendMallFormCodec,
	toSuspendMallSubmitData,
	useSuspendMallForm,
	withSuspendMallForm,
};
