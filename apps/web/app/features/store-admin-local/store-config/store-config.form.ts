import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';

export const { fieldContext, formContext } = createFormHookContexts();

const openHourState = z.object({
	day: z.string(),
	open: z.string(),
	close: z.string(),
	closed: z.boolean(),
});

const storeConfigStateSchema = z.object({
	name: z.string(),
	category: z.string(),
	floor: z.string(),
	localNumber: z.string(),
	openHours: z.array(openHourState),
	logoImageUrl: z.string(),
	phone: z.string(),
	contactEmail: z.string(),
	description: z.string(),
});

const storeConfigDataSchema = z.object({
	name: z
		.string()
		.min(2, { error: 'El nombre debe tener al menos 2 caracteres.' }),
	category: z
		.string()
		.min(2, { error: 'La categoría debe tener al menos 2 caracteres.' }),
	floor: z.string().min(1, { error: 'El piso es obligatorio.' }),
	localNumber: z
		.string()
		.min(1, { error: 'El número de local es obligatorio.' }),
	openHours: z.array(openHourState),
	logoImageUrl: z.string().min(1, { error: 'El logo es obligatorio.' }),
	phone: z.string().optional(),
	contactEmail: z.string().optional(),
	description: z
		.string()
		.max(2000, { error: 'La descripción no puede superar 2000 caracteres.' })
		.optional(),
});

const storeConfigCodec = z.codec(
	storeConfigStateSchema,
	storeConfigDataSchema,
	{
		decode: (state) => ({
			name: state.name.trim(),
			category: state.category.trim(),
			floor: state.floor.trim(),
			localNumber: state.localNumber.trim(),
			openHours: state.openHours,
			logoImageUrl: state.logoImageUrl.trim(),
			phone: state.phone.trim() || undefined,
			contactEmail: state.contactEmail.trim() || undefined,
			description: state.description.trim() || undefined,
		}),
		encode: (data) => ({
			name: data.name,
			category: data.category,
			floor: data.floor,
			localNumber: data.localNumber,
			openHours: data.openHours,
			logoImageUrl: data.logoImageUrl,
			phone: data.phone ?? '',
			contactEmail: data.contactEmail ?? '',
			description: data.description ?? '',
		}),
	},
);

export type StoreConfigFormState = z.infer<typeof storeConfigStateSchema>;
export type StoreConfigFormData = z.infer<typeof storeConfigDataSchema>;
export type StoreConfigHour = z.infer<typeof openHourState>;

export const DEFAULT_HOURS: StoreConfigHour[] = [
	{ day: 'Lunes', open: '09:00', close: '20:00', closed: false },
	{ day: 'Martes', open: '09:00', close: '20:00', closed: false },
	{ day: 'Miércoles', open: '09:00', close: '20:00', closed: false },
	{ day: 'Jueves', open: '09:00', close: '20:00', closed: false },
	{ day: 'Viernes', open: '09:00', close: '21:00', closed: false },
	{ day: 'Sábado', open: '10:00', close: '22:00', closed: false },
	{ day: 'Domingo', open: '10:00', close: '19:00', closed: false },
];

export const DEFAULT_STORE_CONFIG_VALUES: StoreConfigFormState = {
	name: '',
	category: '',
	floor: '',
	localNumber: '',
	openHours: DEFAULT_HOURS,
	logoImageUrl: '',
	phone: '',
	contactEmail: '',
	description: '',
};

export const { useAppForm: useStoreConfigForm, withForm: withStoreConfigForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

export const storeConfigFormOptions = formOptions({
	defaultValues: DEFAULT_STORE_CONFIG_VALUES,
	validators: { onSubmit: storeConfigCodec },
});

export { storeConfigCodec };
