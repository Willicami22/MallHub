import {
	AiBrain01Icon,
	Alert02Icon,
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	HelpCircleIcon,
	MessageQuestionIcon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Textarea,
	toast,
} from '@mallhub/ui';
import { useMutation } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useState } from 'react';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';
import type { Route } from './+types/admin-cc-reports.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: 'Reportes IA | Admin CC' }];
}

type PeriodDays = '7' | '14' | '30' | '90';

function getPeriodDates(days: PeriodDays) {
	const endDate = new Date();
	const startDate = subDays(endDate, Number(days));
	return { startDate, endDate };
}

function severityBadge(severity: 'CRITICAL' | 'WARNING' | 'INFO') {
	if (severity === 'CRITICAL') {
		return (
			<Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800">
				{m.admin_cc_reports_severity_critical()}
			</Badge>
		);
	}
	if (severity === 'WARNING') {
		return (
			<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800">
				{m.admin_cc_reports_severity_warning()}
			</Badge>
		);
	}
	return (
		<Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800">
			{m.admin_cc_reports_severity_info()}
		</Badge>
	);
}

export default function AdminCcAiReportsRoute() {
	const trpc = useTRPC();
	const [period, setPeriod] = useState<PeriodDays>('30');
	const [question, setQuestion] = useState('');

	const generateReportMutation = useMutation(
		trpc.adminCc.aiReports.generateReport.mutationOptions({
			onSuccess: () => toast.success(m.admin_cc_reports_success()),
			onError: () => toast.error(m.trpc_error_forbidden()),
		}),
	);

	const detectAlertsMutation = useMutation(
		trpc.adminCc.aiReports.detectAlerts.mutationOptions({
			onSuccess: () => toast.success(m.admin_cc_reports_detect_success()),
			onError: () => toast.error(m.trpc_error_forbidden()),
		}),
	);

	const askQuestionMutation = useMutation(
		trpc.adminCc.aiReports.askQuestion.mutationOptions({
			onSuccess: () => toast.success(m.admin_cc_reports_ask_success()),
			onError: () => toast.error(m.trpc_error_forbidden()),
		}),
	);

	const handleGenerateReport = () => {
		generateReportMutation.mutate(getPeriodDates(period));
	};

	const handleDetectAlerts = () => {
		detectAlertsMutation.mutate(getPeriodDates(period));
	};

	const handleAskQuestion = () => {
		if (!question.trim()) return;
		askQuestionMutation.mutate({ question, ...getPeriodDates(period) });
	};

	const report = generateReportMutation.data;
	const alertsResult = detectAlertsMutation.data;
	const answerResult = askQuestionMutation.data;

	const periodLabel = {
		'7': m.admin_cc_reports_period_days_7(),
		'14': m.admin_cc_reports_period_days_14(),
		'30': m.admin_cc_reports_period_days_30(),
		'90': m.admin_cc_reports_period_days_90(),
	}[period];

	return (
		<div className="space-y-6 max-w-5xl">
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{m.admin_cc_reports_title()}
					</h1>
					<p className="text-muted-foreground mt-1">
						{m.admin_cc_reports_subtitle()}
					</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{m.admin_cc_reports_period()}:
					</span>
					<Select
						value={period}
						onValueChange={(v) => setPeriod(v as PeriodDays)}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue>{periodLabel}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">
								{m.admin_cc_reports_period_days_7()}
							</SelectItem>
							<SelectItem value="14">
								{m.admin_cc_reports_period_days_14()}
							</SelectItem>
							<SelectItem value="30">
								{m.admin_cc_reports_period_days_30()}
							</SelectItem>
							<SelectItem value="90">
								{m.admin_cc_reports_period_days_90()}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Tabs defaultValue="report">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="report" className="flex items-center gap-2">
						<HugeiconsIcon icon={AiBrain01Icon} className="size-4" />
						{m.admin_cc_reports_tab_report()}
					</TabsTrigger>
					<TabsTrigger value="alerts" className="flex items-center gap-2">
						<HugeiconsIcon icon={Alert02Icon} className="size-4" />
						{m.admin_cc_reports_tab_alerts()}
					</TabsTrigger>
					<TabsTrigger value="ask" className="flex items-center gap-2">
						<HugeiconsIcon icon={MessageQuestionIcon} className="size-4" />
						{m.admin_cc_reports_tab_ask()}
					</TabsTrigger>
				</TabsList>

				{/* ── REPORT TAB ─────────────────────────────────────────── */}
				<TabsContent value="report" className="space-y-4 pt-2">
					<div className="flex justify-end">
						<Button
							onClick={handleGenerateReport}
							disabled={generateReportMutation.isPending}
							className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]"
						>
							{generateReportMutation.isPending ? (
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

					{generateReportMutation.isPending && <ReportSkeleton />}

					{!generateReportMutation.isPending && !report && (
						<EmptyState
							icon={AiBrain01Icon}
							message={m.admin_cc_reports_empty()}
						/>
					)}

					{report && !generateReportMutation.isPending && (
						<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
							{report.dataWarning && (
								<Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
									<HugeiconsIcon
										icon={Alert02Icon}
										className="size-4 text-amber-600"
									/>
									<AlertTitle>Advertencia de datos</AlertTitle>
									<AlertDescription>{report.dataWarning}</AlertDescription>
								</Alert>
							)}

							<Card className="border-indigo-100 dark:border-indigo-900/50">
								<CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20">
									<CardTitle className="flex items-center text-indigo-700 dark:text-indigo-400 text-lg">
										<HugeiconsIcon
											icon={AiBrain01Icon}
											className="mr-2 size-5"
										/>
										{m.admin_cc_reports_summary()}
									</CardTitle>
									<CardDescription>
										{report.mallName} · {report.periodStart} →{' '}
										{report.periodEnd}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-6">
									<p className="text-base leading-relaxed">{report.summary}</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center text-violet-600 dark:text-violet-400 text-base">
										<HugeiconsIcon
											icon={SparklesIcon}
											className="mr-2 size-5"
										/>
										{m.admin_cc_reports_trends()}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{report.trends}
									</p>
								</CardContent>
							</Card>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
											{report.insights.map((insight) => (
												<li key={insight} className="flex items-start gap-2">
													<HugeiconsIcon
														icon={ArrowRight01Icon}
														className="size-4 shrink-0 mt-0.5 text-muted-foreground"
													/>
													<span className="text-sm">{insight}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center text-blue-600 dark:text-blue-500 text-base">
											<HugeiconsIcon
												icon={SparklesIcon}
												className="mr-2 size-5"
											/>
											{m.admin_cc_reports_recommendations()}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{report.recommendations.map((rec, idx) => (
												<Alert
													key={rec}
													className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 py-3"
												>
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														className="size-4 text-blue-600 dark:text-blue-500"
													/>
													<AlertTitle className="text-sm font-medium mb-0.5">
														Acción {idx + 1}
													</AlertTitle>
													<AlertDescription className="text-xs text-muted-foreground">
														{rec}
													</AlertDescription>
												</Alert>
											))}
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}
				</TabsContent>

				{/* ── ALERTS TAB ─────────────────────────────────────────── */}
				<TabsContent value="alerts" className="space-y-4 pt-2">
					<div className="flex justify-end">
						<Button
							onClick={handleDetectAlerts}
							disabled={detectAlertsMutation.isPending}
							className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white min-w-[200px]"
						>
							{detectAlertsMutation.isPending ? (
								<>
									<HugeiconsIcon
										icon={SparklesIcon}
										className="size-4 animate-spin"
									/>
									<span>{m.admin_cc_reports_detecting()}</span>
								</>
							) : (
								<>
									<HugeiconsIcon icon={Alert02Icon} className="size-4" />
									<span>{m.admin_cc_reports_detect_btn()}</span>
								</>
							)}
						</Button>
					</div>

					{detectAlertsMutation.isPending && (
						<div className="space-y-3">
							<Skeleton className="h-24 w-full rounded-xl" />
							<Skeleton className="h-24 w-full rounded-xl" />
							<Skeleton className="h-24 w-full rounded-xl" />
						</div>
					)}

					{!detectAlertsMutation.isPending && !alertsResult && (
						<EmptyState
							icon={Alert02Icon}
							message={m.admin_cc_reports_empty()}
						/>
					)}

					{alertsResult && !detectAlertsMutation.isPending && (
						<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
							{alertsResult.alerts.length === 0 ? (
								<Card className="border-emerald-100 dark:border-emerald-900/50">
									<CardContent className="flex flex-col items-center gap-3 py-10">
										<div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center">
											<HugeiconsIcon
												icon={CheckmarkCircle02Icon}
												className="size-7"
											/>
										</div>
										<p className="text-center text-muted-foreground max-w-sm">
											{m.admin_cc_reports_no_alerts()}
										</p>
									</CardContent>
								</Card>
							) : (
								<>
									{alertsResult.hasCritical && (
										<Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800">
											<HugeiconsIcon
												icon={Alert02Icon}
												className="size-4 text-red-600"
											/>
											<AlertTitle className="text-red-700 dark:text-red-400">
												Se detectaron alertas críticas
											</AlertTitle>
											<AlertDescription>
												Revisa las alertas marcadas como{' '}
												<strong>Crítico</strong> y toma acción inmediata.
											</AlertDescription>
										</Alert>
									)}
									<div className="space-y-3">
										{alertsResult.alerts.map((alert) => (
											<Card
												key={`${alert.severity}-${alert.title}`}
												className={
													alert.severity === 'CRITICAL'
														? 'border-red-200 dark:border-red-800'
														: alert.severity === 'WARNING'
															? 'border-amber-200 dark:border-amber-800'
															: 'border-blue-200 dark:border-blue-800'
												}
											>
												<CardHeader className="pb-2">
													<div className="flex items-start justify-between gap-2">
														<CardTitle className="text-base">
															{alert.title}
														</CardTitle>
														{severityBadge(alert.severity)}
													</div>
													<CardDescription className="text-xs">
														Métrica: {alert.metric}
													</CardDescription>
												</CardHeader>
												<CardContent className="space-y-2">
													<p className="text-sm">{alert.description}</p>
													<p className="text-xs text-muted-foreground">
														<strong>Impacto:</strong> {alert.impact}
													</p>
													<div className="flex items-start gap-2 mt-2 p-2 rounded-md bg-muted/40">
														<HugeiconsIcon
															icon={ArrowRight01Icon}
															className="size-4 shrink-0 mt-0.5 text-muted-foreground"
														/>
														<p className="text-xs">
															<strong>
																{m.admin_cc_reports_action_suggested()}:
															</strong>{' '}
															{alert.action}
														</p>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</>
							)}
						</div>
					)}
				</TabsContent>

				{/* ── ASK TAB ────────────────────────────────────────────── */}
				<TabsContent value="ask" className="space-y-4 pt-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<HugeiconsIcon icon={HelpCircleIcon} className="size-5" />
								{m.admin_cc_reports_question_label()}
							</CardTitle>
							<CardDescription>
								Pregunta en lenguaje natural sobre los datos de tu mall para el
								período seleccionado.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Textarea
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
								placeholder={m.admin_cc_reports_question_placeholder()}
								className="min-h-[100px] resize-none"
								maxLength={500}
							/>
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									{question.length}/500
								</span>
								<Button
									onClick={handleAskQuestion}
									disabled={askQuestionMutation.isPending || !question.trim()}
									className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
								>
									{askQuestionMutation.isPending ? (
										<>
											<HugeiconsIcon
												icon={SparklesIcon}
												className="size-4 animate-spin"
											/>
											<span>{m.admin_cc_reports_asking()}</span>
										</>
									) : (
										<>
											<HugeiconsIcon
												icon={MessageQuestionIcon}
												className="size-4"
											/>
											<span>{m.admin_cc_reports_ask_btn()}</span>
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>

					{askQuestionMutation.isPending && (
						<Skeleton className="h-[120px] w-full rounded-xl" />
					)}

					{answerResult && !askQuestionMutation.isPending && (
						<Card className="border-violet-100 dark:border-violet-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<CardHeader className="bg-violet-50/50 dark:bg-violet-900/20 pb-3">
								<CardTitle className="flex items-center text-violet-700 dark:text-violet-400 text-base">
									<HugeiconsIcon icon={AiBrain01Icon} className="mr-2 size-5" />
									Respuesta de la IA
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<p className="text-sm leading-relaxed whitespace-pre-wrap">
									{answerResult.answer}
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function EmptyState({
	icon,
	message,
}: {
	icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
	message: string;
}) {
	return (
		<Card className="border-dashed border-2 bg-muted/20 pb-8 pt-10 text-center">
			<CardContent className="flex flex-col items-center gap-4">
				<div className="h-16 w-16 bg-muted/60 text-muted-foreground rounded-full flex items-center justify-center">
					<HugeiconsIcon icon={icon} className="size-8" />
				</div>
				<p className="text-muted-foreground max-w-md">{message}</p>
			</CardContent>
		</Card>
	);
}

function ReportSkeleton() {
	return (
		<div className="space-y-4 pt-4">
			<Skeleton className="h-[180px] w-full rounded-xl" />
			<Skeleton className="h-[100px] w-full rounded-xl" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Skeleton className="h-[160px] w-full rounded-xl" />
				<Skeleton className="h-[160px] w-full rounded-xl" />
			</div>
		</div>
	);
}
