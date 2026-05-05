import {
	AiBrain01Icon,
	Alert02Icon,
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Skeleton,
	toast,
} from '@mallhub/ui';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/admin-cc-reports.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: 'Reportes IA | Admin CC' }];
}

export default function AdminCcAiReportsRoute() {
	const trpc = useTRPC();

	const generateReportMutation = useMutation(
		trpc.adminCc.aiReports.generate.mutationOptions({
			onSuccess: () => {
				toast.success(m.admin_cc_reports_success());
			},
			onError: () => {
				toast.error(m.trpc_error_forbidden());
			},
		}),
	);

	const handleGenerate = () => {
		generateReportMutation.mutate();
	};

	const generatedReport = generateReportMutation.data;
	const isPending = generateReportMutation.isPending;

	return (
		<div className="space-y-6 max-w-5xl">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{m.admin_cc_reports_title()}
					</h1>
					<p className="text-muted-foreground mt-1">
						{m.admin_cc_reports_subtitle()}
					</p>
				</div>
				<Button
					onClick={handleGenerate}
					disabled={isPending}
					className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[220px]"
				>
					{isPending ? (
						<>
							<HugeiconsIcon
								icon={SparklesIcon}
								className="size-4 animate-spin"
							/>
							<span>{m.admin_cc_reports_generating()}</span>
						</>
					) : (
						<>
							<HugeiconsIcon icon={AiBrain01Icon} className="size-4" />
							<span>{m.admin_cc_reports_generate_btn()}</span>
						</>
					)}
				</Button>
			</div>

			{isPending && (
				<div className="space-y-4 pt-4">
					<Skeleton className="h-[200px] w-full rounded-xl" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Skeleton className="h-[150px] w-full rounded-xl" />
						<Skeleton className="h-[150px] w-full rounded-xl" />
					</div>
				</div>
			)}

			{!isPending && !generatedReport && (
				<Card className="border-dashed border-2 bg-muted/20 pb-8 pt-10 text-center">
					<CardContent className="flex flex-col items-center gap-4">
						<div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 rounded-full flex items-center justify-center">
							<HugeiconsIcon icon={AiBrain01Icon} className="size-8" />
						</div>
						<div className="max-w-md">
							<p className="text-muted-foreground">
								{m.admin_cc_reports_empty()}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{generatedReport && !isPending && (
				<div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Summary */}
					<Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
						<CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20">
							<CardTitle className="flex items-center text-indigo-700 dark:text-indigo-400 text-lg">
								<HugeiconsIcon icon={AiBrain01Icon} className="mr-2 size-5" />
								{m.admin_cc_reports_summary()}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<p className="text-base leading-relaxed">
								{generatedReport.summary}
							</p>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Insights */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-emerald-600 dark:text-emerald-500 text-base">
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className="mr-2 size-5"
									/>
									{m.admin_cc_reports_insights()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{generatedReport.insights.map((insight: string) => (
										<li key={insight} className="flex items-start gap-2">
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="size-4 shrink-0 mt-1 sm:mt-0.5 text-muted-foreground"
											/>
											<span className="text-sm">{insight}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>

						{/* Alerts */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-amber-600 dark:text-amber-500 text-base">
									<HugeiconsIcon icon={Alert02Icon} className="mr-2 size-5" />
									{m.admin_cc_reports_alerts()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{generatedReport.alerts.map((alert: string) => (
										<li key={alert} className="flex items-start gap-2">
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="size-4 shrink-0 mt-1 sm:mt-0.5 text-muted-foreground"
											/>
											<span className="text-sm">{alert}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</div>

					{/* Recommendations */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center text-blue-600 dark:text-blue-500 text-base">
								<HugeiconsIcon icon={SparklesIcon} className="mr-2 size-5" />
								{m.admin_cc_reports_recommendations()}
							</CardTitle>
							<CardDescription>Acciones sugeridas paso a paso</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{generatedReport.recommendations.map(
									(rec: string, idx: number) => (
										<Alert
											key={rec}
											className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
										>
											<HugeiconsIcon
												icon={CheckmarkCircle02Icon}
												className="size-5 text-blue-600 dark:text-blue-500"
											/>
											<AlertTitle className="mb-1 font-medium">
												Acción Recomendada {idx + 1}
											</AlertTitle>
											<AlertDescription className="text-muted-foreground">
												{rec}
											</AlertDescription>
										</Alert>
									),
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
