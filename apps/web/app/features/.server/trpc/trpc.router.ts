import { adminCcRouter } from '@/features/.server/admin-cc/admin-cc.router';
import { createAdminCcAssignmentMutation } from '@/features/.server/admin-platform/admin-cc-assignment/create-admin-cc-assignment.mutation';
import { listAdminCcAssignmentsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-admin-cc-assignments.query';
import { listAssignableMallsQuery } from '@/features/.server/admin-platform/admin-cc-assignment/list-assignable-malls.query';
import { getBillingSubscriptionQuery } from '@/features/.server/admin-platform/billing/get-billing-subscription.query';
import { listBillingSubscriptionsQuery } from '@/features/.server/admin-platform/billing/list-billing-subscriptions.query';
import { registerBillingPaymentMutation } from '@/features/.server/admin-platform/billing/register-billing-payment.mutation';
import { sendBillingCollectionAlertMutation } from '@/features/.server/admin-platform/billing/send-billing-collection-alert.mutation';
import { upsertMallBillingSubscriptionMutation } from '@/features/.server/admin-platform/billing/upsert-mall-billing-subscription.mutation';
import { upsertStoreBillingSubscriptionMutation } from '@/features/.server/admin-platform/billing/upsert-store-billing-subscription.mutation';
import { activateCampaignMutation } from '@/features/.server/admin-platform/campaigns/activate-campaign.mutation';
import { ensureCampaignExpirationRuntime } from '@/features/.server/admin-platform/campaigns/campaign-expiration-runtime.lib';
import { createCampaignMutation } from '@/features/.server/admin-platform/campaigns/create-campaign.mutation';
import { expireCampaignMutation } from '@/features/.server/admin-platform/campaigns/expire-campaign.mutation';
import { getCampaignQuery } from '@/features/.server/admin-platform/campaigns/get-campaign.query';
import { getCampaignPerformanceReportQuery } from '@/features/.server/admin-platform/campaigns/get-campaign-performance-report.query';
import { listCampaignsQuery } from '@/features/.server/admin-platform/campaigns/list-campaigns.query';
import { pauseCampaignMutation } from '@/features/.server/admin-platform/campaigns/pause-campaign.mutation';
import { updateCampaignMutation } from '@/features/.server/admin-platform/campaigns/update-campaign.mutation';
import { upsertCampaignDailyMetricMutation } from '@/features/.server/admin-platform/campaigns/upsert-campaign-daily-metric.mutation';
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
import { getPublicMallQuery } from '@/features/.server/browse/get-public-mall.query';
import { getPublicProductQuery } from '@/features/.server/browse/get-public-product.query';
import { getPublicStoreQuery } from '@/features/.server/browse/get-public-store.query';
import { listAllPublicProductsQuery } from '@/features/.server/browse/list-all-public-products.query';
import { listPublicMallEventsQuery } from '@/features/.server/browse/list-public-mall-events.query';
import { listPublicMallsQuery } from '@/features/.server/browse/list-public-malls.query';
import { listPublicPromotionsQuery } from '@/features/.server/browse/list-public-promotions.query';
import { listPublicStoreProductsQuery } from '@/features/.server/browse/list-public-store-products.query';
import { listPublicStoresQuery } from '@/features/.server/browse/list-public-stores.query';
import { listActiveCampaignsQuery } from '@/features/.server/campaigns/list-active-campaigns.query';
import { trackCampaignInteractionMutation } from '@/features/.server/campaigns/track-campaign-interaction.mutation';
import { createReservationMutation } from '@/features/.server/reservations/create-reservation.mutation';
import { analyzeProductImagesMutation } from '@/features/.server/store-admin-local/analyze-product-images.mutation';
import { createStorePromotionMutation } from '@/features/.server/store-admin-local/create-store-promotion.mutation';
import { deleteProductMutation } from '@/features/.server/store-admin-local/delete-product.mutation';
import { getDashboardMetricsQuery } from '@/features/.server/store-admin-local/get-dashboard-metrics.query';
import { getMyStoreQuery } from '@/features/.server/store-admin-local/get-my-store.query';
import { getPendingReservationsCountQuery } from '@/features/.server/store-admin-local/get-pending-reservations-count.query';
import { getProductImageUploadUrlMutation } from '@/features/.server/store-admin-local/get-product-image-upload-url.mutation';
import { getStoreBannerUploadUrlMutation } from '@/features/.server/store-admin-local/get-store-banner-upload-url.mutation';
import { getStoreLogoUploadUrlMutation } from '@/features/.server/store-admin-local/get-store-logo-upload-url.mutation';
import { listMyStoreProductsQuery } from '@/features/.server/store-admin-local/list-my-store-products.query';
import { listStorePromotionsQuery } from '@/features/.server/store-admin-local/list-store-promotions.query';
import { listStoreReservationsQuery } from '@/features/.server/store-admin-local/list-store-reservations.query';
import { submitStoreForReviewMutation } from '@/features/.server/store-admin-local/submit-store-for-review.mutation';
import { transitionReservationMutation } from '@/features/.server/store-admin-local/transition-reservation.mutation';
import { updateMyStoreMutation } from '@/features/.server/store-admin-local/update-my-store.mutation';
import { upsertProductMutation } from '@/features/.server/store-admin-local/upsert-product.mutation';
import { createStoreRegistrationMutation } from '@/features/.server/store-registration/create-store-registration.mutation';
import { createStoreRegistrationWithAccountMutation } from '@/features/.server/store-registration/create-store-registration-with-account.mutation';
import { procedures, t } from '@/features/.server/trpc/trpc.init';

ensurePlatformMetricsAggregationRuntime();
ensureCampaignExpirationRuntime();

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
	campaigns: t.router({
		listActive: listActiveCampaignsQuery,
		trackInteraction: trackCampaignInteractionMutation,
	}),
	reservations: t.router({
		create: createReservationMutation,
	}),
	browse: t.router({
		listMalls: listPublicMallsQuery,
		getMall: getPublicMallQuery,
		listStores: listPublicStoresQuery,
		getStore: getPublicStoreQuery,
		listStoreProducts: listPublicStoreProductsQuery,
		getProduct: getPublicProductQuery,
		listAllProducts: listAllPublicProductsQuery,
		listPromotions: listPublicPromotionsQuery,
		listMallEvents: listPublicMallEventsQuery,
	}),
	storeRegistrations: t.router({
		create: createStoreRegistrationMutation,
		createWithAccount: createStoreRegistrationWithAccountMutation,
	}),
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
	adminBilling: t.router({
		list: listBillingSubscriptionsQuery,
		get: getBillingSubscriptionQuery,
		setMallPlan: upsertMallBillingSubscriptionMutation,
		setStorePlan: upsertStoreBillingSubscriptionMutation,
		registerPayment: registerBillingPaymentMutation,
		sendCollectionAlert: sendBillingCollectionAlertMutation,
	}),
	adminCampaigns: t.router({
		list: listCampaignsQuery,
		get: getCampaignQuery,
		getPerformanceReport: getCampaignPerformanceReportQuery,
		create: createCampaignMutation,
		update: updateCampaignMutation,
		activate: activateCampaignMutation,
		pause: pauseCampaignMutation,
		expire: expireCampaignMutation,
		upsertDailyMetric: upsertCampaignDailyMetricMutation,
	}),
	adminCc: adminCcRouter,
	storeAdminLocal: t.router({
		analyzeProductImages: analyzeProductImagesMutation,
		getMyStore: getMyStoreQuery,
		updateMyStore: updateMyStoreMutation,
		submitForReview: submitStoreForReviewMutation,
		getLogoUploadUrl: getStoreLogoUploadUrlMutation,
		getBannerUploadUrl: getStoreBannerUploadUrlMutation,
		getProductImageUploadUrl: getProductImageUploadUrlMutation,
		getDashboardMetrics: getDashboardMetricsQuery,
		listMyStoreProducts: listMyStoreProductsQuery,
		upsertProduct: upsertProductMutation,
		deleteProduct: deleteProductMutation,
		listStoreReservations: listStoreReservationsQuery,
		transitionReservation: transitionReservationMutation,
		getPendingReservationsCount: getPendingReservationsCountQuery,
		listPromotions: listStorePromotionsQuery,
		createPromotion: createStorePromotionMutation,
	}),
});

export type AppRouter = typeof appRouter;
