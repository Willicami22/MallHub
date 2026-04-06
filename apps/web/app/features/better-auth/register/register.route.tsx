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
import {
	LockPasswordIcon,
	Mail01Icon,
	SmartPhone01Icon,
	UserIcon,
	ViewIcon,
	ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ChangeEvent } from 'react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
	signUp,
	useClientSession,
} from '@/features/better-auth/better-auth-client.lib';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/register.route';

export const meta = (_args: Route.MetaArgs) => [
	{ title: m.register_meta_title() },
	{ name: 'description', content: m.register_meta_description() },
];

export default function RegisterRoute() {
	const navigate = useNavigate();
	const session = useClientSession();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (password.length < 8) {
			setError(m.register_password_too_short());
			return;
		}

		if (password !== confirmPassword) {
			setError(m.register_passwords_mismatch());
			return;
		}

		setIsSubmitting(true);

		const response = await signUp.email({
			name,
			email,
			password,
		});

		if (response.error) {
			const message =
				response.error.message ??
				m.register_failed_toast({ message: '' });
			setError(message);
			toast.error(m.register_failed_toast({ message }));
			setIsSubmitting(false);
			return;
		}

		toast.success(m.register_success_toast());
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
					<Button size="lg" render={<Link to={localizeHref('/')} />}>
						{m.login_go_home()}
					</Button>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.register_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.register_description()}
					</p>
				</div>

				<Separator />

				<form className="space-y-5" onSubmit={handleSubmit}>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="name">
								{m.register_name_label()}
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={UserIcon} />
								</InputGroupAddon>
								<InputGroupInput
									id="name"
									type="text"
									placeholder={m.register_name_placeholder()}
									value={name}
									onChange={(event: ChangeEvent<HTMLInputElement>) =>
										setName(event.target.value)
									}
									required
									autoComplete="name"
								/>
							</InputGroup>
						</Field>

						<Field>
							<FieldLabel htmlFor="email">
								{m.register_email_label()}
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={Mail01Icon} />
								</InputGroupAddon>
								<InputGroupInput
									id="email"
									type="email"
									placeholder={m.register_email_placeholder()}
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
							<FieldLabel htmlFor="phone">
								{m.register_phone_label()}
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={SmartPhone01Icon} />
								</InputGroupAddon>
								<InputGroupInput
									id="phone"
									type="tel"
									placeholder={m.register_phone_placeholder()}
									value={phone}
									onChange={(event: ChangeEvent<HTMLInputElement>) =>
										setPhone(event.target.value)
									}
									autoComplete="tel"
								/>
							</InputGroup>
						</Field>

						<Field>
							<FieldLabel htmlFor="password">
								{m.register_password_label()}
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={LockPasswordIcon} />
								</InputGroupAddon>
								<InputGroupInput
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder={m.register_password_placeholder()}
									value={password}
									onChange={(event: ChangeEvent<HTMLInputElement>) =>
										setPassword(event.target.value)
									}
									required
									minLength={8}
									autoComplete="new-password"
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

						<Field>
							<FieldLabel htmlFor="confirm-password">
								{m.register_confirm_password_label()}
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<HugeiconsIcon icon={LockPasswordIcon} />
								</InputGroupAddon>
								<InputGroupInput
									id="confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder={m.register_confirm_password_placeholder()}
									value={confirmPassword}
									onChange={(event: ChangeEvent<HTMLInputElement>) =>
										setConfirmPassword(event.target.value)
									}
									required
									minLength={8}
									autoComplete="new-password"
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										onClick={() =>
											setShowConfirmPassword(!showConfirmPassword)
										}
										aria-label={m.auth_toggle_password()}
									>
										<HugeiconsIcon
											icon={
												showConfirmPassword ? ViewOffSlashIcon : ViewIcon
											}
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
								{m.register_submitting()}
							</>
						) : (
							m.register_submit()
						)}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					{m.register_have_account()}{' '}
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0"
						render={<Link to={localizeHref('/auth/login')} />}
					>
						{m.register_sign_in()}
					</Button>
				</p>
			</div>
		</AuthLayout>
	);
}
