import { Button, Separator } from '@mallhub/ui';
import { Link } from 'react-router';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import { ForgotPasswordForm } from '@/features/store-admin-local/auth/components/forgot-password-form';
import { localizeHref } from '@/paraglide/runtime.js';

export const meta = () => [
	{ title: 'Recuperar acceso' },
	{
		name: 'description',
		content: 'Recuperación de contraseña (stub + flujo global).',
	},
];

export default function StoreLocalForgotPasswordRoute() {
	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						Recuperar contraseña
					</h2>
					<p className="text-sm text-muted-foreground">
						Endpoint simulado; en producción enlaza con Supabase Auth o el flujo
						central.
					</p>
				</div>
				<Separator />
				<ForgotPasswordForm />
				<p className="text-center text-sm text-muted-foreground">
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to={localizeHref('/store-local/login')} />}
					>
						Volver al acceso
					</Button>
				</p>
			</div>
		</AuthLayout>
	);
}
