import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Input,
	Label,
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
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

export default function LoginRoute() {
	const navigate = useNavigate();
	const session = useClientSession();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
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
			<div className="mx-auto flex min-h-dvh w-full max-w-lg items-center justify-center p-4">
				<Card className="w-full">
					<CardHeader>
						<CardTitle>{m.login_session_active_title()}</CardTitle>
						<CardDescription>{session.data.user.email}</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-2">
						<Button render={<Link to={localizeHref('/')} />}>
							{m.login_go_home()}
						</Button>
						<Button
							variant="outline"
							onClick={async () => {
								await signOut();
							}}
						>
							{m.login_sign_out()}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-lg items-center justify-center p-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>{m.login_title()}</CardTitle>
					<CardDescription>{m.login_description()}</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email">{m.login_email_label()}</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(event: ChangeEvent<HTMLInputElement>) =>
									setEmail(event.target.value)
								}
								required
								autoComplete="email"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">{m.login_password_label()}</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(event: ChangeEvent<HTMLInputElement>) =>
									setPassword(event.target.value)
								}
								required
								autoComplete="current-password"
							/>
						</div>
						{error ? <p className="text-sm text-destructive">{error}</p> : null}
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? m.login_submitting() : m.login_submit()}
						</Button>
					</form>
				</CardContent>
				<CardFooter>
					<Button
						variant="outline"
						className="w-full"
						render={<Link to={localizeHref('/')} />}
					>
						{m.login_back_home()}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
