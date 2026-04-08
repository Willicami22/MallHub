import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const registerFormState = z.object({
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	password: z.string(),
	confirmPassword: z.string(),
	formControls: z.object({
		showPassword: z.boolean(),
		showConfirmPassword: z.boolean(),
	}),
});

const registerFormSchema = z
	.object({
		name: z.string().trim().min(1, {
			error: m.register_validation_name_required(),
		}),
		email: z.email({ error: m.register_validation_email_invalid() }),
		phone: z.string(),
		password: z.string().min(8, { error: m.register_password_too_short() }),
		confirmPassword: z
			.string()
			.min(1, { error: m.register_validation_confirm_password_required() }),
	})
	.refine((formData) => formData.password === formData.confirmPassword, {
		path: ['confirmPassword'],
		message: m.register_passwords_mismatch(),
	}) satisfies z.ZodType<{
	name: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
}>;

const registerFormCodec = z.codec(registerFormState, registerFormSchema, {
	decode: (formState) => ({
		name: formState.name.trim(),
		email: formState.email.trim(),
		phone: formState.phone.trim(),
		password: formState.password,
		confirmPassword: formState.confirmPassword,
	}),
	encode: (formData) => ({
		name: formData.name,
		email: formData.email,
		phone: formData.phone,
		password: formData.password,
		confirmPassword: formData.confirmPassword,
		formControls: {
			showPassword: false,
			showConfirmPassword: false,
		},
	}),
});

type RegisterFormState = z.infer<typeof registerFormState>;
type RegisterFormData = z.infer<typeof registerFormSchema>;

const toRegisterSubmitData = (
	formState: RegisterFormState,
): RegisterFormData | null => {
	const decodeResult = registerFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useRegisterForm, withForm: withRegisterForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const DEFAULT_REGISTER_FORM_VALUES: RegisterFormState = {
	name: '',
	email: '',
	phone: '',
	password: '',
	confirmPassword: '',
	formControls: {
		showPassword: false,
		showConfirmPassword: false,
	},
};

const REGISTER_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_REGISTER_FORM_VALUES,
	validators: {
		onSubmit: registerFormCodec,
	},
});

export type { RegisterFormData, RegisterFormState };
export {
	REGISTER_FORM_OPTIONS,
	registerFormCodec,
	toRegisterSubmitData,
	useRegisterForm,
	withRegisterForm,
};
