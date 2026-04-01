import { createAuthClient } from 'better-auth/react';

const getAuthBaseUrl = () => {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/api/auth`;
	}

	if (import.meta.env.VITE_APP_API_URL) {
		return `${import.meta.env.VITE_APP_API_URL}/api/auth`;
	}

	return 'http://localhost:5173/api/auth';
};

const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
	fetchOptions: {
		credentials: 'include',
	},
});

export const useClientSession = authClient.useSession;
export const { signIn, signOut } = authClient;
