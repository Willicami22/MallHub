import {
	type PlatformHealthAlertDiagnostic,
	type PlatformServiceDiagnostic,
	type PlatformServiceKey,
	readPlatformBackofficeAlerts,
	readPlatformServiceDiagnostics,
} from '@/features/.server/admin-platform/health/platform-health-adapters.lib';
import {
	auditEventActions,
	writeAuditEventBestEffort,
} from '@/features/.server/audit/audit-event.lib';
import type { Prisma } from '@/features/.server/prisma/generated/client';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { procedures } from '@/features/.server/trpc/trpc.init';

type PlatformHealthIncidentTransition = {
	incidentId: string;
	serviceKey: PlatformServiceKey;
	summaryCode: string;
	summaryParams?: Prisma.InputJsonValue;
};

const syncPlatformHealthObservability = async (
	diagnostics: PlatformServiceDiagnostic[],
): Promise<void> => {
	const serviceKeys = diagnostics.map((diagnostic) => diagnostic.serviceKey);

	const openIncidents = await prisma.platformHealthIncident.findMany({
		where: {
			status: 'OPEN',
			serviceKey: {
				in: serviceKeys,
			},
		},
		select: {
			id: true,
			serviceKey: true,
			summaryCode: true,
			summaryParamsJson: true,
		},
	});

	const openIncidentByService = new Map(
		openIncidents.map((incident) => [incident.serviceKey, incident]),
	);
	const openedIncidents: PlatformHealthIncidentTransition[] = [];
	const resolvedIncidents: PlatformHealthIncidentTransition[] = [];

	await prisma.$transaction(async (tx) => {
		for (const diagnostic of diagnostics) {
			await tx.platformServiceSnapshot.upsert({
				where: {
					serviceKey: diagnostic.serviceKey,
				},
				create: {
					serviceKey: diagnostic.serviceKey,
					status: diagnostic.status,
					summaryCode: diagnostic.summaryCode,
					summaryParamsJson:
						(diagnostic.summaryParams as Prisma.InputJsonValue | undefined) ??
						undefined,
					metadataJson:
						(diagnostic.metadata as Prisma.InputJsonValue | undefined) ??
						undefined,
					observedAt: diagnostic.observedAt,
				},
				update: {
					status: diagnostic.status,
					summaryCode: diagnostic.summaryCode,
					summaryParamsJson:
						(diagnostic.summaryParams as Prisma.InputJsonValue | undefined) ??
						undefined,
					metadataJson:
						(diagnostic.metadata as Prisma.InputJsonValue | undefined) ??
						undefined,
					observedAt: diagnostic.observedAt,
				},
			});

			const openIncident = openIncidentByService.get(diagnostic.serviceKey);

			if (diagnostic.status === 'INCIDENT') {
				if (openIncident) {
					await tx.platformHealthIncident.update({
						where: { id: openIncident.id },
						data: {
							summaryCode: diagnostic.summaryCode,
							summaryParamsJson:
								(diagnostic.summaryParams as
									| Prisma.InputJsonValue
									| undefined) ?? undefined,
						},
					});
					continue;
				}

				const createdIncident = await tx.platformHealthIncident.create({
					data: {
						serviceKey: diagnostic.serviceKey,
						status: 'OPEN',
						summaryCode: diagnostic.summaryCode,
						summaryParamsJson:
							(diagnostic.summaryParams as Prisma.InputJsonValue | undefined) ??
							undefined,
						metadataJson:
							(diagnostic.metadata as Prisma.InputJsonValue | undefined) ??
							undefined,
						startedAt: diagnostic.observedAt,
					},
					select: {
						id: true,
						serviceKey: true,
						summaryCode: true,
						summaryParamsJson: true,
					},
				});

				openedIncidents.push({
					incidentId: createdIncident.id,
					serviceKey: createdIncident.serviceKey,
					summaryCode: createdIncident.summaryCode,
					summaryParams:
						(createdIncident.summaryParamsJson as Prisma.InputJsonValue | null) ??
						undefined,
				});
				openIncidentByService.set(diagnostic.serviceKey, createdIncident);
				continue;
			}

			if (!openIncident) {
				continue;
			}

			const resolvedIncident = await tx.platformHealthIncident.update({
				where: { id: openIncident.id },
				data: {
					status: 'RESOLVED',
					resolvedAt: diagnostic.observedAt,
				},
				select: {
					id: true,
					serviceKey: true,
					summaryCode: true,
					summaryParamsJson: true,
				},
			});

			resolvedIncidents.push({
				incidentId: resolvedIncident.id,
				serviceKey: resolvedIncident.serviceKey,
				summaryCode: resolvedIncident.summaryCode,
				summaryParams:
					(resolvedIncident.summaryParamsJson as Prisma.InputJsonValue | null) ??
					undefined,
			});
			openIncidentByService.delete(diagnostic.serviceKey);
		}
	});

	await Promise.all([
		...openedIncidents.map((incident) =>
			writeAuditEventBestEffort({
				context: 'adminHealth.status.openIncident',
				action: auditEventActions.ADMIN_HEALTH_INCIDENT_OPENED,
				targetType: 'PLATFORM_HEALTH_INCIDENT',
				targetId: incident.incidentId,
				metadata: {
					serviceKey: incident.serviceKey,
					summaryCode: incident.summaryCode,
					summaryParams: incident.summaryParams,
				},
			}),
		),
		...resolvedIncidents.map((incident) =>
			writeAuditEventBestEffort({
				context: 'adminHealth.status.resolveIncident',
				action: auditEventActions.ADMIN_HEALTH_INCIDENT_RESOLVED,
				targetType: 'PLATFORM_HEALTH_INCIDENT',
				targetId: incident.incidentId,
				metadata: {
					serviceKey: incident.serviceKey,
					summaryCode: incident.summaryCode,
					summaryParams: incident.summaryParams,
				},
			}),
		),
	]);
};

const toSeverityWeight: Record<
	PlatformHealthAlertDiagnostic['severity'],
	number
> = {
	CRITICAL: 0,
	WARNING: 1,
	INFO: 2,
};

export const getPlatformHealthStatusQuery = procedures.adminPlatform.query(
	async () => {
		const [diagnostics, domainAlerts] = await Promise.all([
			readPlatformServiceDiagnostics(),
			readPlatformBackofficeAlerts(),
		]);

		await syncPlatformHealthObservability(diagnostics);

		const serviceAlerts: PlatformHealthAlertDiagnostic[] = diagnostics
			.filter((diagnostic) => diagnostic.status !== 'OPERATIONAL')
			.map((diagnostic) => ({
				id: `service-${diagnostic.serviceKey.toLowerCase()}`,
				severity: diagnostic.status === 'INCIDENT' ? 'CRITICAL' : 'WARNING',
				code: diagnostic.summaryCode,
				params: diagnostic.summaryParams,
				relatedServiceKey: diagnostic.serviceKey,
			}));

		const alerts = [...serviceAlerts, ...domainAlerts].sort((left, right) => {
			return toSeverityWeight[left.severity] - toSeverityWeight[right.severity];
		});

		return {
			services: diagnostics,
			alerts,
			summary: {
				totalServices: diagnostics.length,
				operationalServices: diagnostics.filter(
					(diagnostic) => diagnostic.status === 'OPERATIONAL',
				).length,
				degradedServices: diagnostics.filter(
					(diagnostic) => diagnostic.status === 'DEGRADED',
				).length,
				incidentServices: diagnostics.filter(
					(diagnostic) => diagnostic.status === 'INCIDENT',
				).length,
				lastCheckedAt: new Date(),
			},
		};
	},
);
