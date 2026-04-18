import { createAdminCcAssignmentMutation } from '@/features/.server/admin-platform/admin-cc-assignment/create-admin-cc-assignment.mutation';
import { listAdminCcAssignmentsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-admin-cc-assignments.query';
import { getPlatformMetricsQuery } from '@/features/.server/admin-platform/dashboard/get-platform-metrics.query';
import {
	banUserMutation,
	unbanUserMutation,
} from '@/features/.server/admin-platform/users/ban-user.mutation';
import { createUserMutation } from '@/features/.server/admin-platform/users/create-user.mutation';
import { listUsersQuery } from '@/features/.server/admin-platform/users/list-users.query';
import { setRoleMutation } from '@/features/.server/admin-platform/users/set-role.mutation';
import { listRecentAuditEventsQuery } from '@/features/.server/audit/list-recent-audit-events.query';
import { signInEmailMutation } from '@/features/.server/better-auth/sign-in-email.mutation';
import { signUpEmailMutation } from '@/features/.server/better-auth/sign-up-email.mutation';
import { procedures, t } from '@/features/.server/trpc/trpc.init';

export const appRouter = t.router({
	health: procedures.public.query(() => ({ status: 'ok' as const })),
	auth: t.router({
		signInEmail: signInEmailMutation,
		signUpEmail: signUpEmailMutation,
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
