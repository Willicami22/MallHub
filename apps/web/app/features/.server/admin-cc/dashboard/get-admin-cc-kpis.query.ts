import { z } from 'zod';
import {
	getAggregatedKpis,
	getDefaultMallId,
} from '@/features/.server/mock-db/admin-cc.mock';
import { procedures } from '@/features/.server/trpc/trpc.init';

const getAdminCcKpisInput = z.object({
	startDate: z.string().datetime({ offset: true }),
	endDate: z.string().datetime({ offset: true }),
});

export const getAdminCcKpisQuery = procedures.adminCc
	.input(getAdminCcKpisInput)
	.query(async ({ ctx, input }) => {
		const startDate = new Date(input.startDate);
		const endDate = new Date(input.endDate);

		// Get mall ID from user context or use default
		const mallId = ctx.user?.preferredMallId ?? getDefaultMallId();

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Fetch aggregated KPIs from mock-db
		const kpis = getAggregatedKpis(mallId, startDate, endDate);

		return {
			summary: {
				totalVisits: kpis.totalVisits,
				totalReservations: kpis.totalReservations,
				totalCompleted: kpis.totalCompleted,
				conversionRate: kpis.conversionRate,
				activeStores: kpis.activeStores,
			},
			trends: kpis.timeSeriesData,
		};
	});
