import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const resetPasswordRequestFormState = z.object({
	email: z.string(),
});

const resetPasswordRequestFormSchema = z.object({
	email: z.email({
		error: m.login_validation_email_invalid(),
	}),
}) satisfies z.ZodType<{ email: string }>;

const resetPasswordRequestFormCodec = z.codec(
	resetPasswordRequestFormState,
	resetPasswordRequestFormSchema,
	{
		decode: (formState) => ({
			email: formState.email.trim(),
		}),
		encode: (formData) => ({
			email: formData.email,
		}),
	},
);

type ResetPasswordRequestFormState = z.infer<
	typeof resetPasswordRequestFormState
>;
type ResetPasswordRequestFormData = z.infer<
	typeof resetPasswordRequestFormSchema
>;

const toResetPasswordRequestSubmitData = (
	formState: ResetPasswordRequestFormState,
): ResetPasswordRequestFormData | null => {
	const decodeResult = resetPasswordRequestFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useResetPasswordRequestForm,
	withForm: withResetPasswordRequestForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const DEFAULT_RESET_PASSWORD_REQUEST_FORM_VALUES: ResetPasswordRequestFormState =
	{
		email: '',
	};

const RESET_PASSWORD_REQUEST_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_RESET_PASSWORD_REQUEST_FORM_VALUES,
	validators: {
		onSubmit: resetPasswordRequestFormCodec,
	},
});

export type { ResetPasswordRequestFormData, ResetPasswordRequestFormState };
export {
	RESET_PASSWORD_REQUEST_FORM_OPTIONS,
	resetPasswordRequestFormCodec,
	toResetPasswordRequestSubmitData,
	useResetPasswordRequestForm,
	withResetPasswordRequestForm,
};
