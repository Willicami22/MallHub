import { t } from '@/features/.server/trpc/trpc.init';
import { askQuestionMutation } from './ai-reports/ask-question.mutation';
import { detectAlertsMutation } from './ai-reports/detect-alerts.mutation';
import { generateReportMutation } from './ai-reports/generate-report.mutation';
import { addGalleryImageMutation } from './config/add-gallery-image.mutation';
import { deleteGalleryImageMutation } from './config/delete-gallery-image.mutation';
import { getMallConfigQuery } from './config/get-mall-config.query';
import { getUploadPresignedUrlMutation } from './config/get-upload-presigned-url.mutation';
import { updateMallConfigMutation } from './config/update-mall-config.mutation';
import { updateMallImagesMutation } from './config/update-mall-images.mutation';
import { getAdminCcKpisQuery } from './dashboard/get-admin-cc-kpis.query';
import { approveStoreRegistrationMutation } from './stores/approve-store-registration.mutation';
import { getMallStoresQuery } from './stores/get-mall-stores.query';
import { getPendingCountQuery } from './stores/get-pending-count.query';
import { reactivateStoreMutation } from './stores/reactivate-store.mutation';
import { rejectStoreRegistrationMutation } from './stores/reject-store-registration.mutation';
import { suspendStoreMutation } from './stores/suspend-store.mutation';

export const adminCcDashboardRouter = t.router({
	getKpis: getAdminCcKpisQuery,
});

export const adminCcConfigRouter = t.router({
	getConfig: getMallConfigQuery,
	updateConfig: updateMallConfigMutation,
	updateImages: updateMallImagesMutation,
	getUploadPresignedUrl: getUploadPresignedUrlMutation,
	addGalleryImage: addGalleryImageMutation,
	deleteGalleryImage: deleteGalleryImageMutation,
});

export const adminCcStoresRouter = t.router({
	getStores: getMallStoresQuery,
	getPendingCount: getPendingCountQuery,
	approveRegistration: approveStoreRegistrationMutation,
	rejectRegistration: rejectStoreRegistrationMutation,
	suspend: suspendStoreMutation,
	reactivate: reactivateStoreMutation,
});

export const adminCcReportsRouter = t.router({
	generateReport: generateReportMutation,
	detectAlerts: detectAlertsMutation,
	askQuestion: askQuestionMutation,
});

export const adminCcRouter = t.router({
	dashboard: adminCcDashboardRouter,
	config: adminCcConfigRouter,
	stores: adminCcStoresRouter,
	aiReports: adminCcReportsRouter,
});
