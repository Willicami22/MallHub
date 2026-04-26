import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const campaignUpsertFormState = z.object({
	name: z.string(),
	advertiserName: z.string(),
	bannerType: z.string(),
	imageUrl: z.string(),
	destinationUrl: z.string(),
	startsAt: z.string(),
	endsAt: z.string(),
	targetMallIds: z.array(z.string()),
	activateOnCreate: z.boolean(),
});

const campaignUpsertFormSchema = z
	.object({
		name: z.string().trim().min(1, {
			error: m.admin_campaigns_validation_name_required(),
		}),
		advertiserName: z.string().trim().min(1, {
			error: m.admin_campaigns_validation_advertiser_required(),
		}),
		bannerType: z.enum(['IMAGE', 'NATIVE_CARD']),
		imageUrl: z.string().trim().url({
			error: m.admin_campaigns_validation_image_url_invalid(),
		}),
		destinationUrl: z.string().trim().url({
			error: m.admin_campaigns_validation_destination_url_invalid(),
		}),
		startsAt: z.string().trim().min(1, {
			error: m.admin_campaigns_validation_start_required(),
		}),
		endsAt: z.string().trim().min(1, {
			error: m.admin_campaigns_validation_end_required(),
		}),
		targetMallIds: z.array(z.string().trim().min(1)).min(1, {
			error: m.admin_campaigns_validation_target_mall_required(),
		}),
		activateOnCreate: z.boolean(),
	})
	.refine((value) => value.endsAt >= value.startsAt, {
		path: ['endsAt'],
		message: m.admin_campaigns_validation_end_before_start(),
	}) satisfies z.ZodType<{
	name: string;
	advertiserName: string;
	bannerType: 'IMAGE' | 'NATIVE_CARD';
	imageUrl: string;
	destinationUrl: string;
	startsAt: string;
	endsAt: string;
	targetMallIds: string[];
	activateOnCreate: boolean;
}>;

const campaignUpsertFormCodec = z.codec(
	campaignUpsertFormState,
	campaignUpsertFormSchema,
	{
		decode: (formState) => ({
			name: formState.name.trim(),
			advertiserName: formState.advertiserName.trim(),
			bannerType: formState.bannerType as 'IMAGE' | 'NATIVE_CARD',
			imageUrl: formState.imageUrl.trim(),
			destinationUrl: formState.destinationUrl.trim(),
			startsAt: formState.startsAt.trim(),
			endsAt: formState.endsAt.trim(),
			targetMallIds: Array.from(
				new Set(
					formState.targetMallIds
						.map((mallId) => mallId.trim())
						.filter((mallId) => mallId.length > 0),
				),
			),
			activateOnCreate: formState.activateOnCreate,
		}),
		encode: (formData) => ({
			name: formData.name,
			advertiserName: formData.advertiserName,
			bannerType: formData.bannerType,
			imageUrl: formData.imageUrl,
			destinationUrl: formData.destinationUrl,
			startsAt: formData.startsAt,
			endsAt: formData.endsAt,
			targetMallIds: formData.targetMallIds,
			activateOnCreate: formData.activateOnCreate,
		}),
	},
);

type CampaignUpsertFormState = z.infer<typeof campaignUpsertFormState>;
type CampaignUpsertFormData = z.infer<typeof campaignUpsertFormSchema>;

const toCampaignUpsertSubmitData = (
	formState: CampaignUpsertFormState,
): CampaignUpsertFormData | null => {
	const decodeResult = campaignUpsertFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useCampaignUpsertForm, withForm: withCampaignUpsertForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

type CampaignUpsertInitialValues = Partial<{
	name: string;
	advertiserName: string;
	bannerType: 'IMAGE' | 'NATIVE_CARD';
	imageUrl: string;
	destinationUrl: string;
	startsAt: string;
	endsAt: string;
	targetMallIds: string[];
	activateOnCreate: boolean;
}>;

const getCampaignUpsertFormDefaultValues = (
	initialValues?: CampaignUpsertInitialValues,
): CampaignUpsertFormState => ({
	name: initialValues?.name ?? '',
	advertiserName: initialValues?.advertiserName ?? '',
	bannerType: initialValues?.bannerType ?? 'IMAGE',
	imageUrl: initialValues?.imageUrl ?? '',
	destinationUrl: initialValues?.destinationUrl ?? '',
	startsAt: initialValues?.startsAt ?? '',
	endsAt: initialValues?.endsAt ?? '',
	targetMallIds: initialValues?.targetMallIds ?? [],
	activateOnCreate: initialValues?.activateOnCreate ?? false,
});

const CAMPAIGN_UPSERT_FORM_OPTIONS = formOptions({
	defaultValues: getCampaignUpsertFormDefaultValues(),
	validators: {
		onSubmit: campaignUpsertFormCodec,
	},
});

export type { CampaignUpsertFormData, CampaignUpsertFormState };
export {
	CAMPAIGN_UPSERT_FORM_OPTIONS,
	campaignUpsertFormCodec,
	getCampaignUpsertFormDefaultValues,
	toCampaignUpsertSubmitData,
	useCampaignUpsertForm,
	withCampaignUpsertForm,
};
