import { createAdminCcAssignmentMutation } from '@/features/.server/admin-platform/admin-cc-assignment/create-admin-cc-assignment.mutation';
import { listAdminCcAssignmentsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-admin-cc-assignments.query';
import { listAssignableMallsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-assignable-malls.query';
import { getPlatformMetricsQuery } from '@/features/.server/admin-platform/dashboard/get-platform-metrics.query';
import { getPlatformHealthStatusQuery } from '@/features/.server/admin-platform/health/get-platform-health-status.query';
import { listPlatformHealthIncidentsQuery } from '@/features/.server/admin-platform/health/list-platform-health-incidents.query';
import { activateMallMutation } from '@/features/.server/admin-platform/malls/activate-mall.mutation';
import { createMallMutation } from '@/features/.server/admin-platform/malls/create-mall.mutation';
import { getMallQuery } from '@/features/.server/admin-platform/malls/get-mall.query';
import { listMallsQuery } from '@/features/.server/admin-platform/malls/list-malls.query';
import { reactivateMallMutation } from '@/features/.server/admin-platform/malls/reactivate-mall.mutation';
import { suspendMallMutation } from '@/features/.server/admin-platform/malls/suspend-mall.mutation';
import { updateMallMutation } from '@/features/.server/admin-platform/malls/update-mall.mutation';
import { correctMallProfileFromModerationMutation } from '@/features/.server/admin-platform/moderation/correct-mall-profile-from-moderation.mutation';
import { correctStoreProfileFromModerationMutation } from '@/features/.server/admin-platform/moderation/correct-store-profile-from-moderation.mutation';
import { dismissModerationReportMutation } from '@/features/.server/admin-platform/moderation/dismiss-moderation-report.mutation';
import { getModerationReportQuery } from '@/features/.server/admin-platform/moderation/get-moderation-report.query';
import { listModerationReportsQuery } from '@/features/.server/admin-platform/moderation/list-moderation-reports.query';
import { removeMallImageFromModerationMutation } from '@/features/.server/admin-platform/moderation/remove-mall-image-from-moderation.mutation';
import { removeProductFromModerationMutation } from '@/features/.server/admin-platform/moderation/remove-product-from-moderation.mutation';
import { removeStoreImageFromModerationMutation } from '@/features/.server/admin-platform/moderation/remove-store-image-from-moderation.mutation';
import { approveStoreRegistrationMutation } from '@/features/.server/admin-platform/store-registration/approve-store-registration.mutation';
import { listStoreRegistrationsQuery } from '@/features/.server/admin-platform/store-registration/list-store-registrations.query';
import { rejectStoreRegistrationMutation } from '@/features/.server/admin-platform/store-registration/reject-store-registration.mutation';
import { getStoreQuery } from '@/features/.server/admin-platform/stores/get-store.query';
import { listStoresQuery } from '@/features/.server/admin-platform/stores/list-stores.query';
import { reactivateStoreMutation } from '@/features/.server/admin-platform/stores/reactivate-store.mutation';
import { suspendStoreMutation } from '@/features/.server/admin-platform/stores/suspend-store.mutation';
import {
	banUserMutation,
	unbanUserMutation,
} from '@/features/.server/admin-platform/users/ban-user.mutation';
import { createUserMutation } from '@/features/.server/admin-platform/users/create-user.mutation';
import { listUsersQuery } from '@/features/.server/admin-platform/users/list-users.query';
import { setRoleMutation } from '@/features/.server/admin-platform/users/set-role.mutation';
import { ensurePlatformMetricsAggregationRuntime } from '@/features/.server/analytics/platform-metrics-aggregation-runtime.lib';
import { listAuditEventsQuery } from '@/features/.server/audit/list-audit-events.query';
import { listRecentAuditEventsQuery } from '@/features/.server/audit/list-recent-audit-events.query';
import { expireAdminSessionMutation } from '@/features/.server/better-auth/expire-admin-session.mutation';
import { requestPasswordResetMutation } from '@/features/.server/better-auth/request-password-reset.mutation';
import { resetPasswordMutation } from '@/features/.server/better-auth/reset-password.mutation';
import { signInEmailMutation } from '@/features/.server/better-auth/sign-in-email.mutation';
import { signUpEmailMutation } from '@/features/.server/better-auth/sign-up-email.mutation';
import { procedures, t } from '@/features/.server/trpc/trpc.init';

ensurePlatformMetricsAggregationRuntime();

export const appRouter = t.router({
	health: procedures.public.query(() => ({ status: 'ok' as const })),
	auth: t.router({
		signInEmail: signInEmailMutation,
		signUpEmail: signUpEmailMutation,
		requestPasswordReset: requestPasswordResetMutation,
		resetPassword: resetPasswordMutation,
		expireAdminSession: expireAdminSessionMutation,
	}),
	me: procedures.auth.query(({ ctx }) => ({
		id: ctx.user.id,
		email: ctx.user.email,
		name: ctx.user.name,
	})),
	adminUsers: t.router({
		list: listUsersQuery,
		create: createUserMutation,
		ban: banUserMutation,
		unban: unbanUserMutation,
		setRole: setRoleMutation,
	}),
	adminCcAssignments: t.router({
		list: listAdminCcAssignmentsQuery,
		listMalls: listAssignableMallsQuery,
		create: createAdminCcAssignmentMutation,
	}),
	adminDashboard: t.router({
		metrics: getPlatformMetricsQuery,
	}),
	adminMalls: t.router({
		list: listMallsQuery,
		get: getMallQuery,
		create: createMallMutation,
		update: updateMallMutation,
		activate: activateMallMutation,
		suspend: suspendMallMutation,
		reactivate: reactivateMallMutation,
	}),
	adminStores: t.router({
		list: listStoresQuery,
		get: getStoreQuery,
		suspend: suspendStoreMutation,
		reactivate: reactivateStoreMutation,
	}),
	adminStoreRegistrations: t.router({
		list: listStoreRegistrationsQuery,
		approve: approveStoreRegistrationMutation,
		reject: rejectStoreRegistrationMutation,
	}),
	adminModeration: t.router({
		list: listModerationReportsQuery,
		get: getModerationReportQuery,
		dismiss: dismissModerationReportMutation,
		removeProduct: removeProductFromModerationMutation,
		correctStoreProfile: correctStoreProfileFromModerationMutation,
		correctMallProfile: correctMallProfileFromModerationMutation,
		removeStoreImage: removeStoreImageFromModerationMutation,
		removeMallImage: removeMallImageFromModerationMutation,
	}),
	adminAudit: t.router({
		list: listAuditEventsQuery,
		listRecent: listRecentAuditEventsQuery,
	}),
	adminHealth: t.router({
		status: getPlatformHealthStatusQuery,
		listIncidents: listPlatformHealthIncidentsQuery,
	}),
});

export type AppRouter = typeof appRouter;
