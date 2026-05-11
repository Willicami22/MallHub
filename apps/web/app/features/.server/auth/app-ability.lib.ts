import {
	AbilityBuilder,
	type ExtractSubjectType,
	type PureAbility,
	subject,
} from '@casl/ability';
import {
	type AppSubjects,
	createPrismaAbility,
	type PrismaQuery,
} from '@/features/.server/auth/casl-prisma.lib';
import {
	type AppRole,
	appRoles,
} from '@/features/better-auth/better-auth-access-control.lib';

export const appActions = [
	'manage',
	'read',
	'create',
	'update',
	'delete',
	'approve',
	'reject',
	'confirm',
	'complete',
] as const;

export type AppAction = (typeof appActions)[number];
export type AppAbility = PureAbility<[AppAction, AppSubjects], PrismaQuery>;
export type AppSubjectType = ExtractSubjectType<AppSubjects>;

export type AbilityActor = {
	id: string;
	email: string;
	role: AppRole;
};

type SessionUserLike =
	| {
			id: string;
			email: string;
			role?: unknown;
	  }
	| null
	| undefined;

type DefinePermissions = (
	actor: AbilityActor,
	builder: AbilityBuilder<AppAbility>,
) => void;

const appRoleValues = new Set<AppRole>(Object.values(appRoles));

export const isAppRole = (value: unknown): value is AppRole =>
	typeof value === 'string' && appRoleValues.has(value as AppRole);

export const assertAppRole = (value: unknown): AppRole => {
	if (!isAppRole(value)) {
		throw new Error(`Unknown app role "${String(value)}"`);
	}

	return value;
};

const defineGuestPermissions = ({ can }: AbilityBuilder<AppAbility>): void => {
	can('read', 'Mall', { status: 'ACTIVE' });
	can('read', 'Store', { status: 'ACTIVE' });
	can('read', 'Product', { status: 'ACTIVE' });
	can('read', 'Promotion', { status: 'ACTIVE' });
	can('create', 'SearchLog', { isGuest: true });
};

const defineAuthenticatedBasePermissions = (
	actor: AbilityActor,
	{ can }: AbilityBuilder<AppAbility>,
): void => {
	can('read', 'User', { id: actor.id });
	can('update', 'User', ['name', 'phone', 'image', 'preferredMallId'], {
		id: actor.id,
	});

	can(['read', 'create', 'update'], 'UserProfile', { userId: actor.id });
	can('create', 'SearchLog', { userId: actor.id, isGuest: false });
	can('read', 'Member', { userId: actor.id });
	can('read', 'Invitation', { email: actor.email });
};

const rolePermissions: Record<AppRole, DefinePermissions> = {
	[appRoles.CUSTOMER](actor, { can }) {
		can('create', 'Reservation', { customerUserId: actor.id });
		can('read', 'Reservation', { customerUserId: actor.id });
		can('update', 'Reservation', {
			customerUserId: actor.id,
			status: 'PENDING',
		});

		can(['read', 'create', 'delete'], 'FavoriteStore', { userId: actor.id });
		can(['read', 'create', 'delete'], 'FavoriteProduct', { userId: actor.id });
		can(['read', 'create', 'delete'], 'FavoritePromotion', {
			userId: actor.id,
		});
	},
	[appRoles.ADMIN_LOCAL](actor, { can }) {
		can('create', 'StoreRegistrationRequest', { applicantUserId: actor.id });
		can('read', 'StoreRegistrationRequest', { applicantUserId: actor.id });
		can('update', 'StoreRegistrationRequest', {
			applicantUserId: actor.id,
			status: 'PENDING',
		});

		can(['create', 'read', 'update'], 'Store', { ownerUserId: actor.id });

		can(['create', 'read', 'update', 'delete'], 'Product', {
			store: { is: { ownerUserId: actor.id } },
		});
		can(['create', 'read', 'update', 'delete'], 'Promotion', {
			store: { is: { ownerUserId: actor.id } },
		});

		can(['read', 'update', 'confirm', 'reject', 'complete'], 'Reservation', {
			store: { is: { ownerUserId: actor.id } },
		});

		can(['create', 'read'], 'AiRun', {
			jobType: 'PRODUCT_DRAFT',
			requestedByUserId: actor.id,
			store: { is: { ownerUserId: actor.id } },
		});
	},
	[appRoles.ADMIN_CC](actor, { can }) {
		can(['read', 'update'], 'Mall', { adminCcUserId: actor.id });
		can('read', 'Store', { mall: { is: { adminCcUserId: actor.id } } });
		can('read', 'Product', { mall: { is: { adminCcUserId: actor.id } } });
		can('read', 'Promotion', { mall: { is: { adminCcUserId: actor.id } } });
		can('read', 'Reservation', { mall: { is: { adminCcUserId: actor.id } } });
		can('read', 'SearchLog', { mall: { is: { adminCcUserId: actor.id } } });

		can(['read', 'update', 'approve', 'reject'], 'StoreRegistrationRequest', {
			mall: { is: { adminCcUserId: actor.id } },
		});

		can('read', 'DailyMallMetric', {
			mall: { is: { adminCcUserId: actor.id } },
		});
		can(['create', 'read'], 'AiRun', {
			jobType: 'MALL_REPORT',
			requestedByUserId: actor.id,
			mall: { is: { adminCcUserId: actor.id } },
		});
		can('read', 'AdminCcAssignment', { adminCcUserId: actor.id });
	},
	[appRoles.ADMIN_PLATFORM](actor, { can }) {
		can('create', 'User', { role: appRoles.ADMIN_CC });
		can(['read', 'update'], 'User');
		can('read', 'Mall');
		can('update', 'Mall');
		can(['read', 'update'], 'Store');
		can(['read', 'update'], 'Product');
		can('create', 'AdminCcAssignment', { createdByUserId: actor.id });
		can('read', 'AdminCcAssignment');
		can(['read', 'update'], 'ModerationReport');
		can('read', 'AuditEvent');
		can('read', 'DailyPlatformMetric');
		can('read', 'DailyMallMetric');
		can(['read', 'approve', 'reject'], 'StoreRegistrationRequest');
		can('manage', 'Organization');
		can('manage', 'Member');
		can('manage', 'Invitation');
	},
};

const buildAbility = (
	configure: (builder: AbilityBuilder<AppAbility>) => void,
) => {
	const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);
	configure(builder);
	return builder.build();
};

export const defineAbilityForGuest = (): AppAbility =>
	buildAbility((builder) => {
		defineGuestPermissions(builder);
	});

export const defineAbilityForActor = (actor: AbilityActor): AppAbility =>
	buildAbility((builder) => {
		defineGuestPermissions(builder);
		defineAuthenticatedBasePermissions(actor, builder);
		rolePermissions[actor.role](actor, builder);
	});

export const defineAbilityForSessionUser = (
	user: SessionUserLike,
): { ability: AppAbility; role: AppRole | null } => {
	if (!user) {
		return { ability: defineAbilityForGuest(), role: null };
	}

	const role = assertAppRole(user.role);

	return {
		ability: defineAbilityForActor({
			id: user.id,
			email: user.email,
			role,
		}),
		role,
	};
};

export const asSubject = subject;
