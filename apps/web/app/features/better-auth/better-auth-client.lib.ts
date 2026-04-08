import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import {
	betterAuthAdminRoles,
	betterAuthOrganizationRoles,
} from '@/features/better-auth/better-auth-access-control.lib';
import { clientEnv } from '@/features/env/client-env.lib';

const getAuthBaseUrl = () => {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/api/auth`;
	}

	return `${clientEnv.VITE_APP_API_URL}/api/auth`;
};

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
	fetchOptions: {
		credentials: 'include',
	},
	plugins: [
		adminClient({
			roles: betterAuthAdminRoles,
		}),
		organizationClient({
			roles: betterAuthOrganizationRoles,
		}),
	],
});

export const useClientSession = authClient.useSession;
export const { signIn, signOut, signUp } = authClient;
