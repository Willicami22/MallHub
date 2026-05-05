import { t } from '@/features/.server/trpc/trpc.init';
import { generateAiReportMutation } from './ai-reports/generate-ai-report.mutation';
import { getMallConfigQuery } from './config/get-mall-config.query';
import { updateMallConfigMutation } from './config/update-mall-config.mutation';
import { getAdminCcKpisQuery } from './dashboard/get-admin-cc-kpis.query';
import { addStoreMutation } from './stores/add-store.mutation';
import { getMallStoresQuery } from './stores/get-mall-stores.query';
import {
	reactivateStoreMutation,
	suspendStoreMutation,
	updateStoreStatusMutation,
} from './stores/update-store-status.mutation';

export const adminCcDashboardRouter = t.router({
	getKpis: getAdminCcKpisQuery,
});

export const adminCcConfigRouter = t.router({
	getConfig: getMallConfigQuery,
	updateConfig: updateMallConfigMutation,
});

export const adminCcStoresRouter = t.router({
	getStores: getMallStoresQuery,
	updateStatus: updateStoreStatusMutation,
	suspend: suspendStoreMutation,
	reactivate: reactivateStoreMutation,
	add: addStoreMutation,
});

export const adminCcReportsRouter = t.router({
	generate: generateAiReportMutation,
});

export const adminCcRouter = t.router({
	dashboard: adminCcDashboardRouter,
	config: adminCcConfigRouter,
	stores: adminCcStoresRouter,
	aiReports: adminCcReportsRouter,
});
