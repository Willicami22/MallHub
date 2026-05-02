export type StoreLocalCredentials = {
	email: string;
	password: string;
};

export type RegisterStorePayload = {
	storeName: string;
	slug: string;
	ownerEmail: string;
	password: string;
};

export type PasswordResetRequest = {
	email: string;
};

export type AuthSessionSnapshot = {
	userId: string;
	email: string;
	activeStoreId: string | null;
};
