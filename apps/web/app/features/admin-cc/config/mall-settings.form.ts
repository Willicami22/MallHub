import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

// Schemas
const mallSettingsStateSchema = z.object({
	name: z.string(),
	description: z.string(),
	address: z.string(),
	hours: z
		.array(
			z.object({
				day: z.string(),
				open: z.string(),
				close: z.string(),
			}),
		)
		.default([]),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.default([]),
});

const mallSettingsDataSchema = z.object({
	name: z.string().min(1, { message: m.validation_required() }),
	description: z.string(),
	address: z.string().min(1, { message: m.validation_required() }),
	hours: z
		.array(
			z.object({
				day: z.string(),
				open: z.string(),
				close: z.string(),
			}),
		)
		.default([]),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.default([]),
});

type MallSettingsFormData = z.infer<typeof mallSettingsDataSchema>;
type MallSettingsFormState = z.infer<typeof mallSettingsStateSchema>;

export type MallSettingsHour = z.infer<
	typeof mallSettingsStateSchema
>['hours'][number];
export type MallSettingsCategory = z.infer<
	typeof mallSettingsStateSchema
>['categories'][number];

const mallSettingsCodec = {
	async parse(value: unknown) {
		const stateResult = mallSettingsStateSchema.safeParse(value);
		if (!stateResult.success) {
			throw stateResult.error;
		}
		return mallSettingsDataSchema.parse({
			name: stateResult.data.name.trim(),
			description: stateResult.data.description.trim(),
			address: stateResult.data.address.trim(),
			hours: stateResult.data.hours,
			categories: stateResult.data.categories,
		});
	},
} as const;

export const {
	useAppForm: useMallSettingsForm,
	withForm: withMallSettingsForm,
} = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
});

const DEFAULT_VALUES: MallSettingsFormState = {
	name: '',
	description: '',
	address: '',
	hours: [],
	categories: [],
};

export const mallSettingsFormOptions = formOptions({
	defaultValues: DEFAULT_VALUES,
	validators: {
		onSubmit: async (value) => {
			return mallSettingsDataSchema.parse(value);
		},
	},
});

export type { MallSettingsFormData, MallSettingsFormState };
export { DEFAULT_VALUES, mallSettingsCodec };
