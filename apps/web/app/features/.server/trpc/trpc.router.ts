import { createAdminCcAssignmentMutation } from '@/features/.server/admin-platform/admin-cc-assignment/create-admin-cc-assignment.mutation';
import { listAdminCcAssignmentsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-admin-cc-assignments.query';
import { listAssignableMallsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-assignable-malls.query';
import { getPlatformMetricsQuery } from '@/features/.server/admin-platform/dashboard/get-platform-metrics.query';
import {
	banUserMutation,
	unbanUserMutation,
} from '@/features/.server/admin-platform/users/ban-user.mutation';
import { createUserMutation } from '@/features/.server/admin-platform/users/create-user.mutation';
import { listUsersQuery } from '@/features/.server/admin-platform/users/list-users.query';
import { setRoleMutation } from '@/features/.server/admin-platform/users/set-role.mutation';
import { ensurePlatformMetricsAggregationRuntime } from '@/features/.server/analytics/platform-metrics-aggregation-runtime.lib';
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
	adminAudit: t.router({
		listRecent: listRecentAuditEventsQuery,
	}),
});

export type AppRouter = typeof appRouter;
