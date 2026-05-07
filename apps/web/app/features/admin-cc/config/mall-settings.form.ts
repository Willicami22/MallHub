import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const openHourState = z.object({
	day: z.string(),
	open: z.string(),
	close: z.string(),
	closed: z.boolean(),
});

const socialLinksState = z.object({
	instagram: z.string(),
	facebook: z.string(),
	website: z.string(),
});

const mallConfigStateSchema = z.object({
	name: z.string(),
	city: z.string(),
	address: z.string(),
	description: z.string(),
	phone: z.string(),
	openHours: z.array(openHourState),
	socialLinks: socialLinksState,
});

const mallConfigDataSchema = z.object({
	name: z.string().min(1, { error: m.validation_required() }),
	city: z.string().min(1, { error: m.validation_required() }),
	address: z.string().min(1, { error: m.validation_required() }),
	description: z.string(),
	phone: z.string(),
	openHours: z.array(openHourState),
	socialLinks: socialLinksState,
}) satisfies z.ZodType<{
	name: string;
	city: string;
	address: string;
	description: string;
	phone: string;
	openHours: Array<{
		day: string;
		open: string;
		close: string;
		closed: boolean;
	}>;
	socialLinks: { instagram: string; facebook: string; website: string };
}>;

const mallConfigCodec = z.codec(mallConfigStateSchema, mallConfigDataSchema, {
	decode: (state) => ({
		name: state.name.trim(),
		city: state.city.trim(),
		address: state.address.trim(),
		description: state.description.trim(),
		phone: state.phone.trim(),
		openHours: state.openHours,
		socialLinks: {
			instagram: state.socialLinks.instagram.trim(),
			facebook: state.socialLinks.facebook.trim(),
			website: state.socialLinks.website.trim(),
		},
	}),
	encode: (data) => ({
		name: data.name,
		city: data.city,
		address: data.address,
		description: data.description,
		phone: data.phone,
		openHours: data.openHours,
		socialLinks: data.socialLinks,
	}),
});

export type MallConfigFormState = z.infer<typeof mallConfigStateSchema>;
export type MallConfigFormData = z.infer<typeof mallConfigDataSchema>;
export type MallConfigHour = z.infer<typeof openHourState>;

export const DEFAULT_HOURS: MallConfigHour[] = [
	{ day: 'Lunes', open: '09:00', close: '20:00', closed: false },
	{ day: 'Martes', open: '09:00', close: '20:00', closed: false },
	{ day: 'Miércoles', open: '09:00', close: '20:00', closed: false },
	{ day: 'Jueves', open: '09:00', close: '20:00', closed: false },
	{ day: 'Viernes', open: '09:00', close: '21:00', closed: false },
	{ day: 'Sábado', open: '10:00', close: '22:00', closed: false },
	{ day: 'Domingo', open: '10:00', close: '19:00', closed: false },
];

export const DEFAULT_SOCIAL = { instagram: '', facebook: '', website: '' };

export const DEFAULT_FORM_VALUES: MallConfigFormState = {
	name: '',
	city: '',
	address: '',
	description: '',
	phone: '',
	openHours: DEFAULT_HOURS,
	socialLinks: DEFAULT_SOCIAL,
};

export const { useAppForm: useMallConfigForm, withForm: withMallConfigForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

export const mallConfigFormOptions = formOptions({
	defaultValues: DEFAULT_FORM_VALUES,
	validators: { onSubmit: mallConfigCodec },
});

export { mallConfigCodec };
