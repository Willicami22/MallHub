import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const assignAdminCcFormState = z.object({
	mallId: z.string(),
});

const assignAdminCcFormSchema = z.object({
	mallId: z.string().trim().min(1, {
		error: m.admin_users_assign_mall_required(),
	}),
});

const assignAdminCcFormCodec = z.codec(
	assignAdminCcFormState,
	assignAdminCcFormSchema,
	{
		decode: (formState) => ({
			mallId: formState.mallId.trim(),
		}),
		encode: (formData) => ({
			mallId: formData.mallId,
		}),
	},
);

type AssignAdminCcFormState = z.infer<typeof assignAdminCcFormState>;
type AssignAdminCcFormData = z.infer<typeof assignAdminCcFormSchema>;

const toAssignAdminCcSubmitData = (
	formState: AssignAdminCcFormState,
): AssignAdminCcFormData | null => {
	const decodeResult = assignAdminCcFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useAssignAdminCcForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const getAssignAdminCcFormDefaultValues = (): AssignAdminCcFormState => ({
	mallId: '',
});

const ASSIGN_ADMIN_CC_FORM_OPTIONS = formOptions({
	defaultValues: getAssignAdminCcFormDefaultValues(),
	validators: {
		onSubmit: assignAdminCcFormCodec,
	},
});

export type { AssignAdminCcFormData, AssignAdminCcFormState };
export {
	ASSIGN_ADMIN_CC_FORM_OPTIONS,
	getAssignAdminCcFormDefaultValues,
	toAssignAdminCcSubmitData,
	useAssignAdminCcForm,
};
