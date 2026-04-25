import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';

export const auditEventActions = {
	ADMIN_USER_CREATED: 'admin.user.created',
	ADMIN_USER_ROLE_UPDATED: 'admin.user.role.updated',
	ADMIN_USER_BANNED: 'admin.user.banned',
	ADMIN_USER_UNBANNED: 'admin.user.unbanned',
	ADMIN_CC_ASSIGNMENT_CREATED: 'admin.cc.assignment.created',
	ADMIN_MALL_CREATED: 'admin.mall.created',
	ADMIN_MALL_UPDATED: 'admin.mall.updated',
	ADMIN_MALL_ACTIVATED: 'admin.mall.activated',
	ADMIN_MALL_SUSPENDED: 'admin.mall.suspended',
	ADMIN_MALL_REACTIVATED: 'admin.mall.reactivated',
	ADMIN_STORE_SUSPENDED: 'admin.store.suspended',
	ADMIN_STORE_REACTIVATED: 'admin.store.reactivated',
	ADMIN_STORE_REGISTRATION_APPROVED: 'admin.store-registration.approved',
	ADMIN_STORE_REGISTRATION_REJECTED: 'admin.store-registration.rejected',
	ADMIN_PLATFORM_PASSWORD_RESET_COMPLETED:
		'admin.platform.password-reset.completed',
	ADMIN_PLATFORM_SESSION_EXPIRED: 'admin.platform.session.expired',
} as const;

export type AuditEventAction =
	(typeof auditEventActions)[keyof typeof auditEventActions];

type WriteAuditEventInput = {
	actorUserId?: string | null;
	action: AuditEventAction;
	targetType: string;
	targetId?: string | null;
	outcome?: 'SUCCESS' | 'FAILURE';
	metadata?: Prisma.InputJsonValue;
};

export const writeAuditEvent = async ({
	actorUserId,
	action,
	targetType,
	targetId,
	outcome,
	metadata,
}: WriteAuditEventInput) => {
	return prisma.auditEvent.create({
		data: {
			actorUserId: actorUserId ?? null,
			action,
			targetType,
			targetId: targetId ?? null,
			outcome: outcome ?? 'SUCCESS',
			metadataJson: metadata,
		},
	});
};

type WriteAuditEventBestEffortInput = WriteAuditEventInput & {
	context: string;
};

export const writeAuditEventBestEffort = async ({
	context,
	...input
}: WriteAuditEventBestEffortInput): Promise<void> => {
	try {
		await writeAuditEvent(input);
	} catch (error) {
		console.error('[audit.write.failed]', {
			context,
			action: input.action,
			targetType: input.targetType,
			targetId: input.targetId ?? null,
			actorUserId: input.actorUserId ?? null,
			error,
		});
	}
};
