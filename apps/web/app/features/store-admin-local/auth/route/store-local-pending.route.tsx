import {
	CheckmarkCircle01Icon,
	LockPasswordIcon,
	MailAtSign01Icon,
	Store02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@mallhub/ui';
import { Link } from 'react-router';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

export const meta = () => [{ title: m.store_pending_title() }];

const steps = [
	{
		icon: MailAtSign01Icon,
		titleFn: m.store_pending_step_email_title,
		descriptionFn: m.store_pending_step_email_description,
	},
	{
		icon: CheckmarkCircle01Icon,
		titleFn: m.store_pending_step_review_title,
		descriptionFn: m.store_pending_step_review_description,
	},
	{
		icon: Store02Icon,
		titleFn: m.store_pending_step_access_title,
		descriptionFn: m.store_pending_step_access_description,
	},
] as const;

export default function StoreLocalPendingRoute() {
	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="flex flex-col items-center space-y-3 text-center">
					<div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
						<HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-7" />
					</div>
					<div className="space-y-1">
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.store_pending_title()}
						</h2>
						<p className="text-sm text-muted-foreground">
							{m.store_pending_description()}
						</p>
					</div>
				</div>

				<ol className="space-y-4">
					{steps.map(({ icon, titleFn, descriptionFn }) => (
						<li key={titleFn()} className="flex gap-4">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
								<HugeiconsIcon icon={icon} className="size-4" />
							</div>
							<div className="space-y-0.5 pt-0.5">
								<p className="text-sm font-medium text-foreground">
									{titleFn()}
								</p>
								<p className="text-xs text-muted-foreground">
									{descriptionFn()}
								</p>
							</div>
						</li>
					))}
				</ol>

				<Button
					size="lg"
					className="w-full"
					nativeButton={false}
					render={<Link to={localizeHref('/auth/login')} />}
				>
					<HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
					{m.store_pending_go_login()}
				</Button>
			</div>
		</AuthLayout>
	);
}
