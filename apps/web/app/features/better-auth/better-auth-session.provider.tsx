import { createContext, type ReactNode, useContext } from 'react';
import { useClientSession } from '@/features/better-auth/better-auth-client.lib';

type ClientSession = ReturnType<typeof useClientSession>;
type ClientSessionData = ClientSession['data'];

type SessionContextValue = Omit<ClientSession, 'data'> & {
	data: ClientSessionData | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
	children: ReactNode;
	initialSession: ClientSessionData | null;
};

export function SessionProvider({
	children,
	initialSession,
}: SessionProviderProps) {
	const clientSession = useClientSession();
	const value: SessionContextValue = {
		...clientSession,
		data: clientSession.data ?? initialSession,
	};

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	);
}

export function useAppSession() {
	const session = useContext(SessionContext);

	if (!session) {
		throw new Error('useAppSession must be used within SessionProvider');
	}

	return session;
}
