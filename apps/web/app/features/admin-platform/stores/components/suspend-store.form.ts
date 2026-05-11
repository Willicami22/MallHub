import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const suspendStoreFormState = z.object({
	reason: z.string(),
});

const suspendStoreFormSchema = z.object({
	reason: z.string().trim().min(1, {
		error: m.admin_stores_validation_suspend_reason_required(),
	}),
}) satisfies z.ZodType<{
	reason: string;
}>;

const suspendStoreFormCodec = z.codec(
	suspendStoreFormState,
	suspendStoreFormSchema,
	{
		decode: (formState) => ({
			reason: formState.reason.trim(),
		}),
		encode: (formData) => ({
			reason: formData.reason,
		}),
	},
);

type SuspendStoreFormState = z.infer<typeof suspendStoreFormState>;
type SuspendStoreFormData = z.infer<typeof suspendStoreFormSchema>;

const toSuspendStoreSubmitData = (
	formState: SuspendStoreFormState,
): SuspendStoreFormData | null => {
	const decodeResult = suspendStoreFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useSuspendStoreForm, withForm: withSuspendStoreForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const SUSPEND_STORE_FORM_OPTIONS = formOptions({
	defaultValues: {
		reason: '',
	} satisfies SuspendStoreFormState,
	validators: {
		onSubmit: suspendStoreFormCodec,
	},
});

export type { SuspendStoreFormData, SuspendStoreFormState };
export {
	SUSPEND_STORE_FORM_OPTIONS,
	suspendStoreFormCodec,
	toSuspendStoreSubmitData,
	useSuspendStoreForm,
	withSuspendStoreForm,
};
