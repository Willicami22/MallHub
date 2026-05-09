import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const storeRegisterFormState = z.object({
	mallId: z.string(),
	storeName: z.string(),
	category: z.string(),
	mail: z.string(),
	password: z.string(),
	confirmPassword: z.string(),
	contactPhone: z.string(),
	description: z.string(),
	formControls: z.object({
		showPassword: z.boolean(),
		showConfirmPassword: z.boolean(),
	}),
});

const storeRegisterFormSchema = z
	.object({
		mallId: z.string().min(1, { error: m.store_register_mall_required() }),
		storeName: z
			.string()
			.trim()
			.min(2, { error: m.store_register_store_name_min() }),
		category: z.string().min(1, { error: m.store_register_category_min() }),
		mail: z.email({ error: m.register_validation_email_invalid() }),
		password: z.string().min(8, { error: m.register_password_too_short() }),
		confirmPassword: z.string().min(1, {
			error: m.register_validation_confirm_password_required(),
		}),
		contactPhone: z
			.string()
			.trim()
			.min(7, { error: m.store_register_phone_min() })
			.max(20, { error: m.store_register_phone_max() }),
		description: z
			.string()
			.max(2000, { error: m.store_register_description_max() }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: m.register_passwords_mismatch(),
	}) satisfies z.ZodType<{
	mallId: string;
	storeName: string;
	category: string;
	mail: string;
	password: string;
	confirmPassword: string;
	contactPhone: string;
	description: string;
}>;

const storeRegisterFormCodec = z.codec(
	storeRegisterFormState,
	storeRegisterFormSchema,
	{
		decode: (state) => ({
			mallId: state.mallId,
			storeName: state.storeName.trim(),
			category: state.category,
			mail: state.mail.trim(),
			password: state.password,
			confirmPassword: state.confirmPassword,
			contactPhone: state.contactPhone.trim(),
			description: state.description,
		}),
		encode: (data) => ({
			mallId: data.mallId,
			storeName: data.storeName,
			category: data.category,
			mail: data.mail,
			password: data.password,
			confirmPassword: data.confirmPassword,
			contactPhone: data.contactPhone,
			description: data.description,
			formControls: {
				showPassword: false,
				showConfirmPassword: false,
			},
		}),
	},
);

type StoreRegisterFormState = z.infer<typeof storeRegisterFormState>;
type StoreRegisterFormData = z.infer<typeof storeRegisterFormSchema>;

const toStoreRegisterSubmitData = (
	state: StoreRegisterFormState,
): StoreRegisterFormData | null => {
	const result = storeRegisterFormCodec.safeDecode(state);
	return result.success ? result.data : null;
};

const { useAppForm: useStoreRegisterForm, withForm: withStoreRegisterForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const DEFAULT_STORE_REGISTER_FORM_VALUES: StoreRegisterFormState = {
	mallId: '',
	storeName: '',
	category: '',
	mail: '',
	password: '',
	confirmPassword: '',
	contactPhone: '',
	description: '',
	formControls: {
		showPassword: false,
		showConfirmPassword: false,
	},
};

const STORE_REGISTER_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_STORE_REGISTER_FORM_VALUES,
	validators: {
		onSubmit: storeRegisterFormCodec,
	},
});

export type { StoreRegisterFormData, StoreRegisterFormState };
export {
	STORE_REGISTER_FORM_OPTIONS,
	storeRegisterFormCodec,
	toStoreRegisterSubmitData,
	useStoreRegisterForm,
	withStoreRegisterForm,
};
