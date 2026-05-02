import { useCallback, useMemo } from 'react';
import { signOut } from '@/features/better-auth/better-auth-client.lib';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { useStoreAdminContextStore } from '@/features/store-admin-local/auth/store/store-admin-context.store';

/**
 * Punto único de lectura para sesión de plataforma + contexto de tienda activa.
 * La mutación de credenciales vive en componentes/hooks que llaman a `authService`.
 */
export function useAuth() {
	const session = useAppSession();
	const activeStoreId = useStoreAdminContextStore(
		(state) => state.activeStoreId,
	);
	const setActiveStoreId = useStoreAdminContextStore(
		(state) => state.setActiveStoreId,
	);

	const user = useMemo(() => {
		const data = session.data;
		if (!data?.user) {
			return null;
		}
		return {
			id: data.user.id,
			email: data.user.email,
			role: data.user.role,
		};
	}, [session.data]);

	const signOutEverywhere = useCallback(async () => {
		await signOut();
		setActiveStoreId(null);
	}, [setActiveStoreId]);

	return {
		user,
		isAuthenticated: Boolean(user),
		sessionPending: session.isPending,
		activeStoreId,
		setActiveStoreId,
		signOut: signOutEverywhere,
	};
}
