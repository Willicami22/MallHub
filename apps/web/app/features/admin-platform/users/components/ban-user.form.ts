import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';

export const { fieldContext, formContext } = createFormHookContexts();

const banUserFormState = z.object({
	reason: z.string(),
});

const banUserFormSchema = z.object({
	reason: z.string(),
}) satisfies z.ZodType<{
	reason: string;
}>;

const banUserFormCodec = z.codec(banUserFormState, banUserFormSchema, {
	decode: (formState) => ({
		reason: formState.reason.trim(),
	}),
	encode: (formData) => ({
		reason: formData.reason,
	}),
});

type BanUserFormState = z.infer<typeof banUserFormState>;
type BanUserFormData = z.infer<typeof banUserFormSchema>;

const toBanUserSubmitData = (
	formState: BanUserFormState,
): BanUserFormData | null => {
	const decodeResult = banUserFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useBanUserForm, withForm: withBanUserForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const DEFAULT_BAN_USER_FORM_VALUES: BanUserFormState = {
	reason: '',
};

const BAN_USER_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_BAN_USER_FORM_VALUES,
	validators: {
		onSubmit: banUserFormCodec,
	},
});

export type { BanUserFormData, BanUserFormState };
export {
	BAN_USER_FORM_OPTIONS,
	banUserFormCodec,
	toBanUserSubmitData,
	useBanUserForm,
	withBanUserForm,
};
