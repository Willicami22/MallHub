import {
	LockPasswordIcon,
	Mail01Icon,
	ViewIcon,
	ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Separator,
	Spinner,
	toast,
} from '@mallhub/ui';
import type { ChangeEvent } from 'react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
	signIn,
	signOut,
	useClientSession,
} from '@/features/better-auth/better-auth-client.lib';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/login.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.login_meta_title() },
	{ name: 'description', content: m.login_meta_description() },
];

export default function LoginRoute() {
	const navigate = useNavigate();
	const session = useClientSession();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		const response = await signIn.email({ email, password });

		if (response.error) {
			const message = response.error.message ?? m.login_invalid_credentials();
			setError(message);
			toast.error(m.login_failed_toast({ message }));
			setIsSubmitting(false);
			return;
		}

		toast.success(m.login_success_toast());
		navigate(localizeHref('/'));
	};

	if (session.data) {
		return (
			<AuthLayout>
				<div className="space-y-6 text-center">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">
							{m.login_session_active_title()}
						</h2>
						<p className="text-sm text-muted-foreground">
							{session.data.user.email}
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button size="lg" render={<Link to={localizeHref('/')} />}>
							{m.login_go_home()}
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={async () => {
								await signOut();
							}}
						>
							{m.login_sign_out()}
						</Button>
					</div>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.login_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.login_description()}
					</p>
				</div>

				<Separator />

				<form className="space-y-5" onSubmit={handleSubmit}>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">{m.login_email_label()}</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={Mail01Icon} />
								</InputGroupAddon>
								<InputGroupInput
									id="email"
									type="email"
									placeholder={m.login_email_placeholder()}
									value={email}
									onChange={(event: ChangeEvent<HTMLInputElement>) =>
										setEmail(event.target.value)
									}
									required
									autoComplete="email"
								/>
							</InputGroup>
						</Field>

						<Field>
							<FieldLabel htmlFor="password">
								{m.login_password_label()}
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={LockPasswordIcon} />
								</InputGroupAddon>
								<InputGroupInput
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder={m.login_password_placeholder()}
									value={password}
									onChange={(event: ChangeEvent<HTMLInputElement>) =>
										setPassword(event.target.value)
									}
									required
									autoComplete="current-password"
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										onClick={() => setShowPassword(!showPassword)}
										aria-label={m.auth_toggle_password()}
									>
										<HugeiconsIcon
											icon={showPassword ? ViewOffSlashIcon : ViewIcon}
										/>
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</Field>
					</FieldGroup>

					{error ? <FieldError>{error}</FieldError> : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Spinner />
								{m.login_submitting()}
							</>
						) : (
							m.login_submit()
						)}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					{m.login_no_account()}{' '}
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0"
						render={<Link to={localizeHref('/auth/register')} />}
					>
						{m.login_create_account()}
					</Button>
				</p>
			</div>
		</AuthLayout>
	);
}
