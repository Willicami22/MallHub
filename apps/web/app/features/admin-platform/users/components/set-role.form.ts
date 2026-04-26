import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from '@tanstack/react-form';
import { z } from 'zod';
import {
	ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES,
	type AdminPlatformAssignableUserRole,
} from '@/features/admin-platform/users/admin-users-policy.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';

export const { fieldContext, formContext } = createFormHookContexts();

const userRoleSchema = z.enum(ADMIN_PLATFORM_ASSIGNABLE_USER_ROLES);

const setRoleFormState = z.object({
	role: userRoleSchema,
	formControls: z.object({
		initialRole: userRoleSchema,
	}),
});

const setRoleFormSchema = z.object({
	role: userRoleSchema,
}) satisfies z.ZodType<{
	role: AdminPlatformAssignableUserRole;
}>;

const setRoleFormCodec = z.codec(setRoleFormState, setRoleFormSchema, {
	decode: (formState) => ({
		role: formState.role,
	}),
	encode: (formData) => ({
		role: formData.role,
		formControls: {
			initialRole: formData.role,
		},
	}),
});

type SetRoleFormState = z.infer<typeof setRoleFormState>;
type SetRoleFormData = z.infer<typeof setRoleFormSchema>;

const toSetRoleSubmitData = (
	formState: SetRoleFormState,
): SetRoleFormData | null => {
	const decodeResult = setRoleFormCodec.safeDecode(formState);
	return decodeResult.success ? decodeResult.data : null;
};

const { useAppForm: useSetRoleForm, withForm: withSetRoleForm } =
	createFormHook({
		fieldContext,
		formContext,
		fieldComponents: {},
		formComponents: {},
	});

const getSetRoleFormDefaultValues = (
	initialRole: AdminPlatformAssignableUserRole,
): SetRoleFormState => ({
	role: initialRole,
	formControls: {
		initialRole,
	},
});

const SET_ROLE_FORM_OPTIONS = formOptions({
	defaultValues: getSetRoleFormDefaultValues(appRoles.CUSTOMER),
	validators: {
		onSubmit: setRoleFormCodec,
	},
});

export type { SetRoleFormData, SetRoleFormState };
export {
	getSetRoleFormDefaultValues,
	SET_ROLE_FORM_OPTIONS,
	setRoleFormCodec,
	toSetRoleSubmitData,
	useSetRoleForm,
	withSetRoleForm,
};
