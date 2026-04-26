import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const updateBillingPlanFormState = z.object({
	planCode: z.string(),
	status: z.string(),
	currentPeriodStart: z.string(),
	nextPaymentDueAt: z.string(),
	reason: z.string(),
});

const updateBillingPlanFormSchema = z.object({
	planCode: z.enum(['BASIC', 'STANDARD', 'PREMIUM'], {
		error: m.admin_billing_validation_plan_required(),
	}),
	status: z.enum(['ACTIVE', 'OVERDUE', 'SUSPENDED'], {
		error: m.admin_billing_validation_status_required(),
	}),
	currentPeriodStart: z.string().trim().min(1, {
		error: m.admin_billing_validation_current_period_start_required(),
	}),
	nextPaymentDueAt: z.string().trim().nullable(),
	reason: z.string().trim().max(500).nullable(),
}) satisfies z.ZodType<{
	planCode: 'BASIC' | 'STANDARD' | 'PREMIUM';
	status: 'ACTIVE' | 'OVERDUE' | 'SUSPENDED';
	currentPeriodStart: string;
	nextPaymentDueAt: string | null;
	reason: string | null;
}>;

const updateBillingPlanFormCodec = z.codec(
	updateBillingPlanFormState,
	updateBillingPlanFormSchema,
	{
		decode: (formState) => ({
			planCode: formState.planCode as 'BASIC' | 'STANDARD' | 'PREMIUM',
			status: formState.status as 'ACTIVE' | 'OVERDUE' | 'SUSPENDED',
			currentPeriodStart: formState.currentPeriodStart.trim(),
			nextPaymentDueAt: formState.nextPaymentDueAt.trim().length
				? formState.nextPaymentDueAt.trim()
				: null,
			reason: formState.reason.trim().length ? formState.reason.trim() : null,
		}),
		encode: (formData) => ({
			planCode: formData.planCode,
			status: formData.status,
			currentPeriodStart: formData.currentPeriodStart,
			nextPaymentDueAt: formData.nextPaymentDueAt ?? '',
			reason: formData.reason ?? '',
		}),
	},
);

type UpdateBillingPlanFormState = z.infer<typeof updateBillingPlanFormState>;
type UpdateBillingPlanFormData = z.infer<typeof updateBillingPlanFormSchema>;

const toUpdateBillingPlanSubmitData = (
	formState: UpdateBillingPlanFormState,
): UpdateBillingPlanFormData | null => {
	const decodeResult = updateBillingPlanFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useUpdateBillingPlanForm,
	withForm: withUpdateBillingPlanForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

type UpdateBillingPlanInitialValues = Partial<{
	planCode: 'BASIC' | 'STANDARD' | 'PREMIUM';
	status: 'ACTIVE' | 'OVERDUE' | 'SUSPENDED';
	currentPeriodStart: string;
	nextPaymentDueAt: string | null;
	reason: string | null;
}>;

const getUpdateBillingPlanFormDefaultValues = (
	initialValues?: UpdateBillingPlanInitialValues,
): UpdateBillingPlanFormState => ({
	planCode: initialValues?.planCode ?? 'BASIC',
	status: initialValues?.status ?? 'ACTIVE',
	currentPeriodStart: initialValues?.currentPeriodStart ?? '',
	nextPaymentDueAt: initialValues?.nextPaymentDueAt ?? '',
	reason: initialValues?.reason ?? '',
});

const UPDATE_BILLING_PLAN_FORM_OPTIONS = formOptions({
	defaultValues: getUpdateBillingPlanFormDefaultValues(),
	validators: {
		onSubmit: updateBillingPlanFormCodec,
	},
});

export type { UpdateBillingPlanFormData, UpdateBillingPlanFormState };
export {
	getUpdateBillingPlanFormDefaultValues,
	toUpdateBillingPlanSubmitData,
	UPDATE_BILLING_PLAN_FORM_OPTIONS,
	updateBillingPlanFormCodec,
	useUpdateBillingPlanForm,
	withUpdateBillingPlanForm,
};
