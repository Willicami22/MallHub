import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const loginFormState = z.object({
	email: z.string(),
	password: z.string(),
	formControls: z.object({
		showPassword: z.boolean(),
	}),
});

const loginFormSchema = z.object({
	email: z.email({ error: m.login_validation_email_invalid() }),
	password: z
		.string()
		.min(1, { error: m.login_validation_password_required() }),
}) satisfies z.ZodType<{
	email: string;
	password: string;
}>;

const loginFormCodec = z.codec(loginFormState, loginFormSchema, {
	decode: (formState) => ({
		email: formState.email.trim(),
		password: formState.password,
	}),
	encode: (formData) => ({
		email: formData.email,
		password: formData.password,
		formControls: {
			showPassword: false,
		},
	}),
});

type LoginFormState = z.infer<typeof loginFormState>;
type LoginFormData = z.infer<typeof loginFormSchema>;

const toLoginSubmitData = (formState: LoginFormState): LoginFormData | null => {
	const decodeResult = loginFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useLoginForm, withForm: withLoginForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const DEFAULT_LOGIN_FORM_VALUES: LoginFormState = {
	email: '',
	password: '',
	formControls: {
		showPassword: false,
	},
};

const LOGIN_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_LOGIN_FORM_VALUES,
	validators: {
		onSubmit: loginFormCodec,
	},
});

export type { LoginFormData, LoginFormState };
export {
	LOGIN_FORM_OPTIONS,
	loginFormCodec,
	toLoginSubmitData,
	useLoginForm,
	withLoginForm,
};
