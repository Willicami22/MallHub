import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const registerBillingPaymentFormState = z.object({
	amount: z.string(),
	paidAt: z.string(),
	reference: z.string(),
	notes: z.string(),
});

const registerBillingPaymentFormSchema = z.object({
	amount: z
		.string()
		.trim()
		.min(1, {
			error: m.admin_billing_validation_amount_positive(),
		})
		.refine((value) => {
			const numericValue = Number(value);
			return Number.isFinite(numericValue) && numericValue > 0;
		}, m.admin_billing_validation_amount_positive()),
	paidAt: z.string().trim().nullable(),
	reference: z.string().trim().max(120).nullable(),
	notes: z.string().trim().max(500).nullable(),
}) satisfies z.ZodType<{
	amount: string;
	paidAt: string | null;
	reference: string | null;
	notes: string | null;
}>;

const registerBillingPaymentFormCodec = z.codec(
	registerBillingPaymentFormState,
	registerBillingPaymentFormSchema,
	{
		decode: (formState) => ({
			amount: formState.amount.trim(),
			paidAt: formState.paidAt.trim().length ? formState.paidAt.trim() : null,
			reference: formState.reference.trim().length
				? formState.reference.trim()
				: null,
			notes: formState.notes.trim().length ? formState.notes.trim() : null,
		}),
		encode: (formData) => ({
			amount: formData.amount,
			paidAt: formData.paidAt ?? '',
			reference: formData.reference ?? '',
			notes: formData.notes ?? '',
		}),
	},
);

type RegisterBillingPaymentFormState = z.infer<
	typeof registerBillingPaymentFormState
>;
type RegisterBillingPaymentFormData = z.infer<
	typeof registerBillingPaymentFormSchema
>;

const toRegisterBillingPaymentSubmitData = (
	formState: RegisterBillingPaymentFormState,
): RegisterBillingPaymentFormData | null => {
	const decodeResult = registerBillingPaymentFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useRegisterBillingPaymentForm,
	withForm: withRegisterBillingPaymentForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const REGISTER_BILLING_PAYMENT_FORM_OPTIONS = formOptions({
	defaultValues: {
		amount: '',
		paidAt: '',
		reference: '',
		notes: '',
	} satisfies RegisterBillingPaymentFormState,
	validators: {
		onSubmit: registerBillingPaymentFormCodec,
	},
});

export type { RegisterBillingPaymentFormData, RegisterBillingPaymentFormState };
export {
	REGISTER_BILLING_PAYMENT_FORM_OPTIONS,
	registerBillingPaymentFormCodec,
	toRegisterBillingPaymentSubmitData,
	useRegisterBillingPaymentForm,
	withRegisterBillingPaymentForm,
};
