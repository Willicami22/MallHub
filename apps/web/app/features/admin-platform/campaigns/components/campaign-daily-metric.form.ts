import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const campaignDailyMetricFormState = z.object({
	metricDate: z.string(),
	impressions: z.string(),
	clicks: z.string(),
});

const campaignDailyMetricFormSchema = z
	.object({
		metricDate: z.string().trim().min(1, {
			error: m.admin_campaigns_validation_metric_date_required(),
		}),
		impressions: z
			.string()
			.trim()
			.min(1, {
				error: m.admin_campaigns_validation_impressions_required(),
			})
			.refine((value) => {
				const numericValue = Number(value);
				return Number.isInteger(numericValue) && numericValue >= 0;
			}, m.admin_campaigns_validation_impressions_required()),
		clicks: z
			.string()
			.trim()
			.min(1, {
				error: m.admin_campaigns_validation_clicks_required(),
			})
			.refine((value) => {
				const numericValue = Number(value);
				return Number.isInteger(numericValue) && numericValue >= 0;
			}, m.admin_campaigns_validation_clicks_required()),
	})
	.refine((value) => Number(value.clicks) <= Number(value.impressions), {
		path: ['clicks'],
		message: m.admin_campaigns_validation_clicks_exceed_impressions(),
	}) satisfies z.ZodType<{
	metricDate: string;
	impressions: string;
	clicks: string;
}>;

const campaignDailyMetricFormCodec = z.codec(
	campaignDailyMetricFormState,
	campaignDailyMetricFormSchema,
	{
		decode: (formState) => ({
			metricDate: formState.metricDate.trim(),
			impressions: formState.impressions.trim(),
			clicks: formState.clicks.trim(),
		}),
		encode: (formData) => ({
			metricDate: formData.metricDate,
			impressions: formData.impressions,
			clicks: formData.clicks,
		}),
	},
);

type CampaignDailyMetricFormState = z.infer<
	typeof campaignDailyMetricFormState
>;
type CampaignDailyMetricFormData = z.infer<
	typeof campaignDailyMetricFormSchema
>;

const toCampaignDailyMetricSubmitData = (
	formState: CampaignDailyMetricFormState,
): CampaignDailyMetricFormData | null => {
	const decodeResult = campaignDailyMetricFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const {
	useAppForm: useCampaignDailyMetricForm,
	withForm: withCampaignDailyMetricForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const CAMPAIGN_DAILY_METRIC_FORM_OPTIONS = formOptions({
	defaultValues: {
		metricDate: '',
		impressions: '',
		clicks: '',
	} satisfies CampaignDailyMetricFormState,
	validators: {
		onSubmit: campaignDailyMetricFormCodec,
	},
});

export type { CampaignDailyMetricFormData, CampaignDailyMetricFormState };
export {
	CAMPAIGN_DAILY_METRIC_FORM_OPTIONS,
	campaignDailyMetricFormCodec,
	toCampaignDailyMetricSubmitData,
	useCampaignDailyMetricForm,
	withCampaignDailyMetricForm,
};
