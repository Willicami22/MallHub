type ModerationNotificationRecipient = {
	email: string;
	name: string;
};

type ModerationProductContext = {
	name: string;
	store: {
		owner: ModerationNotificationRecipient | null;
	} | null;
	mall: {
		adminCcUser: ModerationNotificationRecipient | null;
	} | null;
} | null;

type ModerationStoreContext = {
	name: string;
	owner: ModerationNotificationRecipient | null;
	mall: {
		adminCcUser: ModerationNotificationRecipient | null;
	} | null;
} | null;

type ModerationMallContext = {
	name: string;
	adminCcUser: ModerationNotificationRecipient | null;
} | null;

type ResolveModerationContextInput = {
	product?: ModerationProductContext;
	store?: ModerationStoreContext;
	mall?: ModerationMallContext;
	fallbackTargetName: string;
};

export type ModerationRecipients = {
	adminLocalUser: ModerationNotificationRecipient | null;
	adminCcUser: ModerationNotificationRecipient | null;
};

export const resolveModerationTargetName = ({
	product,
	store,
	mall,
	fallbackTargetName,
}: ResolveModerationContextInput): string =>
	product?.name ?? store?.name ?? mall?.name ?? fallbackTargetName;

export const resolveModerationRecipients = ({
	product,
	store,
	mall,
}: ResolveModerationContextInput): ModerationRecipients => {
	if (product) {
		return {
			adminLocalUser: product.store?.owner ?? null,
			adminCcUser: product.mall?.adminCcUser ?? null,
		};
	}

	if (store) {
		return {
			adminLocalUser: store.owner ?? null,
			adminCcUser: store.mall?.adminCcUser ?? null,
		};
	}

	if (mall) {
		return {
			adminLocalUser: null,
			adminCcUser: mall.adminCcUser ?? null,
		};
	}

	return {
		adminLocalUser: null,
		adminCcUser: null,
	};
};
