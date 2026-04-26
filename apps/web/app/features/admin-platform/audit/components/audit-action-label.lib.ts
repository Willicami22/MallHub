import * as m from '@/paraglide/messages.js';

const ACTION_LABELS: Record<string, () => string> = {
	'admin.user.created': () =>
		m.admin_dashboard_activity_action_admin_user_created(),
	'admin.user.role.updated': () =>
		m.admin_dashboard_activity_action_admin_user_role_updated(),
	'admin.user.banned': () =>
		m.admin_dashboard_activity_action_admin_user_banned(),
	'admin.user.unbanned': () =>
		m.admin_dashboard_activity_action_admin_user_unbanned(),
	'admin.cc.assignment.created': () =>
		m.admin_dashboard_activity_action_admin_cc_assignment_created(),
	'admin.mall.created': () =>
		m.admin_dashboard_activity_action_admin_mall_created(),
	'admin.mall.updated': () =>
		m.admin_dashboard_activity_action_admin_mall_updated(),
	'admin.mall.activated': () =>
		m.admin_dashboard_activity_action_admin_mall_activated(),
	'admin.mall.suspended': () =>
		m.admin_dashboard_activity_action_admin_mall_suspended(),
	'admin.mall.reactivated': () =>
		m.admin_dashboard_activity_action_admin_mall_reactivated(),
	'admin.store.suspended': () =>
		m.admin_dashboard_activity_action_admin_store_suspended(),
	'admin.store.reactivated': () =>
		m.admin_dashboard_activity_action_admin_store_reactivated(),
	'admin.store-registration.approved': () =>
		m.admin_dashboard_activity_action_admin_store_registration_approved(),
	'admin.store-registration.rejected': () =>
		m.admin_dashboard_activity_action_admin_store_registration_rejected(),
	'admin.moderation.report.dismissed': () =>
		m.admin_dashboard_activity_action_admin_moderation_report_dismissed(),
	'admin.moderation.product.removed': () =>
		m.admin_dashboard_activity_action_admin_moderation_product_removed(),
	'admin.moderation.store-profile.corrected': () =>
		m.admin_dashboard_activity_action_admin_moderation_store_profile_corrected(),
	'admin.moderation.mall-profile.corrected': () =>
		m.admin_dashboard_activity_action_admin_moderation_mall_profile_corrected(),
	'admin.moderation.store-image.removed': () =>
		m.admin_dashboard_activity_action_admin_moderation_store_image_removed(),
	'admin.moderation.mall-image.removed': () =>
		m.admin_dashboard_activity_action_admin_moderation_mall_image_removed(),
	'admin.health.incident.opened': () =>
		m.admin_dashboard_activity_action_admin_health_incident_opened(),
	'admin.health.incident.resolved': () =>
		m.admin_dashboard_activity_action_admin_health_incident_resolved(),
	'admin.billing.mall-plan.set': () =>
		m.admin_dashboard_activity_action_admin_billing_mall_plan_set(),
	'admin.billing.store-plan.set': () =>
		m.admin_dashboard_activity_action_admin_billing_store_plan_set(),
	'admin.billing.payment.registered': () =>
		m.admin_dashboard_activity_action_admin_billing_payment_registered(),
	'admin.billing.collection-alert.sent': () =>
		m.admin_dashboard_activity_action_admin_billing_collection_alert_sent(),
	'admin.notifications.email.enqueue-failed': () =>
		m.admin_dashboard_activity_action_admin_notifications_email_enqueue_failed(),
	'admin.campaign.created': () =>
		m.admin_dashboard_activity_action_admin_campaign_created(),
	'admin.campaign.updated': () =>
		m.admin_dashboard_activity_action_admin_campaign_updated(),
	'admin.campaign.activated': () =>
		m.admin_dashboard_activity_action_admin_campaign_activated(),
	'admin.campaign.paused': () =>
		m.admin_dashboard_activity_action_admin_campaign_paused(),
	'admin.campaign.expired': () =>
		m.admin_dashboard_activity_action_admin_campaign_expired(),
	'admin.campaign.auto-expired': () =>
		m.admin_dashboard_activity_action_admin_campaign_auto_expired(),
	'admin.campaign.daily-metric.upserted': () =>
		m.admin_dashboard_activity_action_admin_campaign_daily_metric_upserted(),
	'admin.platform.password-reset.completed': () =>
		m.admin_dashboard_activity_action_admin_platform_password_reset_completed(),
	'admin.platform.session.expired': () =>
		m.admin_dashboard_activity_action_admin_platform_session_expired(),
};

export const getAuditActionLabel = (action: string): string =>
	ACTION_LABELS[action]?.() ?? action;
