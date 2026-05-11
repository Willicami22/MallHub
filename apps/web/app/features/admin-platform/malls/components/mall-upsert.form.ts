import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const mallUpsertFormState = z.object({
	name: z.string(),
	city: z.string(),
	address: z.string(),
	description: z.string(),
	adminCcUserId: z.string(),
});

const mallUpsertFormSchema = z.object({
	name: z.string().trim().min(1, {
		error: m.admin_malls_validation_name_required(),
	}),
	city: z.string().trim().min(1, {
		error: m.admin_malls_validation_city_required(),
	}),
	address: z.string().trim().min(1, {
		error: m.admin_malls_validation_address_required(),
	}),
	description: z.string().trim().max(1000).nullable(),
	adminCcUserId: z.string().trim().nullable(),
}) satisfies z.ZodType<{
	name: string;
	city: string;
	address: string;
	description: string | null;
	adminCcUserId: string | null;
}>;

const mallUpsertFormCodec = z.codec(mallUpsertFormState, mallUpsertFormSchema, {
	decode: (formState) => ({
		name: formState.name.trim(),
		city: formState.city.trim(),
		address: formState.address.trim(),
		description: formState.description.trim().length
			? formState.description.trim()
			: null,
		adminCcUserId: formState.adminCcUserId.trim().length
			? formState.adminCcUserId.trim()
			: null,
	}),
	encode: (formData) => ({
		name: formData.name,
		city: formData.city,
		address: formData.address,
		description: formData.description ?? '',
		adminCcUserId: formData.adminCcUserId ?? '',
	}),
});

type MallUpsertFormState = z.infer<typeof mallUpsertFormState>;
type MallUpsertFormData = z.infer<typeof mallUpsertFormSchema>;

const toMallUpsertSubmitData = (
	formState: MallUpsertFormState,
): MallUpsertFormData | null => {
	const decodeResult = mallUpsertFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useMallUpsertForm, withForm: withMallUpsertForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

type MallUpsertFormInitialValues = Partial<{
	name: string;
	city: string;
	address: string;
	description: string | null;
	adminCcUserId: string | null;
}>;

const getMallUpsertFormDefaultValues = (
	initialValues?: MallUpsertFormInitialValues,
): MallUpsertFormState => ({
	name: initialValues?.name ?? '',
	city: initialValues?.city ?? '',
	address: initialValues?.address ?? '',
	description: initialValues?.description ?? '',
	adminCcUserId: initialValues?.adminCcUserId ?? '',
});

const MALL_UPSERT_FORM_OPTIONS = formOptions({
	defaultValues: getMallUpsertFormDefaultValues(),
	validators: {
		onSubmit: mallUpsertFormCodec,
	},
});

export type { MallUpsertFormData, MallUpsertFormState };
export {
	getMallUpsertFormDefaultValues,
	MALL_UPSERT_FORM_OPTIONS,
	mallUpsertFormCodec,
	toMallUpsertSubmitData,
	useMallUpsertForm,
	withMallUpsertForm,
};
