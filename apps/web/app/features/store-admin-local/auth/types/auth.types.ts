export type StoreLocalCredentials = {
	email: string;
	password: string;
};

export type RegisterStorePayload = {
	mallId: string;
	storeName: string;
	category: string;
	mail: string;
	contactPhone: string;
	description?: string;
};

export type PasswordResetRequest = {
	email: string;
};

export type AuthSessionSnapshot = {
	userId: string;
	email: string;
	activeStoreId: string | null;
};
