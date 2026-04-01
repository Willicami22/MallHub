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
			const message = response.error.message ?? 'Credenciales inválidas';
			setError(message);
			toast.error(`No se pudo iniciar sesión: ${message}`);
			setIsSubmitting(false);
			return;
		}

		toast.success('Sesión iniciada');
		navigate('/');
	};

	if (session.data) {
		return (
			<div className="mx-auto flex min-h-dvh w-full max-w-lg items-center justify-center p-4">
				<Card className="w-full">
					<CardHeader>
						<CardTitle>Ya tienes sesión activa</CardTitle>
						<CardDescription>{session.data.user.email}</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-2">
						<Button render={<Link to="/" />}>Ir al home</Button>
						<Button
							variant="outline"
							onClick={async () => {
								await signOut();
							}}
						>
							Cerrar sesión
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
					<CardTitle>Iniciar sesión</CardTitle>
					<CardDescription>
						Accede con tu cuenta de Better Auth.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
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
							<Label htmlFor="password">Contraseña</Label>
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
							{isSubmitting ? 'Ingresando...' : 'Ingresar'}
						</Button>
					</form>
				</CardContent>
				<CardFooter>
					<Button variant="outline" className="w-full" render={<Link to="/" />}>
						Volver al home
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
