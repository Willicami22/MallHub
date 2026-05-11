import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const resetPasswordConfirmFormState = z.object({
	newPassword: z.string(),
	confirmPassword: z.string(),
	formControls: z.object({
		showNewPassword: z.boolean(),
		showConfirmPassword: z.boolean(),
	}),
});

const resetPasswordConfirmFormSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, { error: m.auth_reset_password_password_too_short() })
			.max(128, { error: m.auth_reset_password_password_too_long() }),
		confirmPassword: z.string().min(1, {
			error: m.reset_password_confirm_validation_confirm_required(),
		}),
	})
	.refine((formData) => formData.newPassword === formData.confirmPassword, {
		path: ['confirmPassword'],
		message: m.reset_password_confirm_validation_passwords_mismatch(),
	}) satisfies z.ZodType<{
	newPassword: string;
	confirmPassword: string;
}>;

const resetPasswordConfirmFormCodec = z.codec(
	resetPasswordConfirmFormState,
	resetPasswordConfirmFormSchema,
	{
		decode: (formState) => ({
			newPassword: formState.newPassword,
			confirmPassword: formState.confirmPassword,
		}),
		encode: (formData) => ({
			newPassword: formData.newPassword,
			confirmPassword: formData.confirmPassword,
			formControls: {
				showNewPassword: false,
				showConfirmPassword: false,
			},
		}),
	},
);

type ResetPasswordConfirmFormState = z.infer<
	typeof resetPasswordConfirmFormState
>;
type ResetPasswordConfirmFormData = z.infer<
	typeof resetPasswordConfirmFormSchema
>;

const toResetPasswordConfirmSubmitData = (
	formState: ResetPasswordConfirmFormState,
): ResetPasswordConfirmFormData | null => {
	const decodeResult = resetPasswordConfirmFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useResetPasswordConfirmForm,
	withForm: withResetPasswordConfirmForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const DEFAULT_RESET_PASSWORD_CONFIRM_FORM_VALUES: ResetPasswordConfirmFormState =
	{
		newPassword: '',
		confirmPassword: '',
		formControls: {
			showNewPassword: false,
			showConfirmPassword: false,
		},
	};

const RESET_PASSWORD_CONFIRM_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_RESET_PASSWORD_CONFIRM_FORM_VALUES,
	validators: {
		onSubmit: resetPasswordConfirmFormCodec,
	},
});

export type { ResetPasswordConfirmFormData, ResetPasswordConfirmFormState };
export {
	RESET_PASSWORD_CONFIRM_FORM_OPTIONS,
	resetPasswordConfirmFormCodec,
	toResetPasswordConfirmSubmitData,
	useResetPasswordConfirmForm,
	withResetPasswordConfirmForm,
};
