import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import { ADMIN_PLATFORM_CREATABLE_USER_ROLES } from '@/features/admin-platform/users/admin-users-policy.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

export const { fieldContext, formContext } = createFormHookContexts();

const createUserRoleSchema = z.enum(ADMIN_PLATFORM_CREATABLE_USER_ROLES);

const createUserFormState = z.object({
	name: z.string(),
	email: z.string(),
	password: z.string(),
	role: createUserRoleSchema,
	formControls: z.object({
		open: z.boolean(),
	}),
});

const createUserFormSchema = z.object({
	name: z.string().trim().min(1, {
		error: m.admin_users_validation_name_required(),
	}),
	email: z.email({ error: m.admin_users_validation_email_invalid() }),
	password: z
		.string()
		.min(8, { error: m.admin_users_validation_password_short() }),
	role: createUserRoleSchema,
}) satisfies z.ZodType<{
	name: string;
	email: string;
	password: string;
	role: z.infer<typeof createUserRoleSchema>;
}>;

const createUserFormCodec = z.codec(createUserFormState, createUserFormSchema, {
	decode: (formState) => ({
		name: formState.name.trim(),
		email: formState.email.trim(),
		password: formState.password,
		role: formState.role,
	}),
	encode: (formData) => ({
		name: formData.name,
		email: formData.email,
		password: formData.password,
		role: formData.role,
		formControls: {
			open: false,
		},
	}),
});

type CreateUserFormState = z.infer<typeof createUserFormState>;
type CreateUserFormData = z.infer<typeof createUserFormSchema>;

const toCreateUserSubmitData = (
	formState: CreateUserFormState,
): CreateUserFormData | null => {
	const decodeResult = createUserFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useCreateUserForm, withForm: withCreateUserForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const DEFAULT_CREATE_USER_FORM_VALUES: CreateUserFormState = {
	name: '',
	email: '',
	password: '',
	role: appRoles.ADMIN_CC,
	formControls: {
		open: false,
	},
};

const CREATE_USER_FORM_OPTIONS = formOptions({
	defaultValues: DEFAULT_CREATE_USER_FORM_VALUES,
	validators: {
		onSubmit: createUserFormCodec,
	},
});

export type { CreateUserFormData, CreateUserFormState };
export {
	CREATE_USER_FORM_OPTIONS,
	createUserFormCodec,
	toCreateUserSubmitData,
	useCreateUserForm,
	withCreateUserForm,
};
