import { z } from 'zod';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const generateAiReportOutput = z.object({
	summary: z.string(),
	insights: z.array(z.string()),
	alerts: z.array(z.string()),
	recommendations: z.array(z.string()),
});

export const generateAiReportQuery = procedures.adminCc
	.output(generateAiReportOutput)
	.query(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		const locale = getLocaleFromAsyncStorage();

		return {
			summary: m.admin_cc_reports_mock_summary({}, { locale }),
			insights: [
				m.admin_cc_reports_mock_insight_1({}, { locale }),
				m.admin_cc_reports_mock_insight_2({}, { locale }),
				m.admin_cc_reports_mock_insight_3({}, { locale }),
			],
			alerts: [
				m.admin_cc_reports_mock_alert_1({}, { locale }),
				m.admin_cc_reports_mock_alert_2({}, { locale }),
			],
			recommendations: [
				m.admin_cc_reports_mock_recommendation_1({}, { locale }),
				m.admin_cc_reports_mock_recommendation_2({}, { locale }),
				m.admin_cc_reports_mock_recommendation_3({}, { locale }),
			],
		};
	});
