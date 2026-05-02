import { Button, Separator } from '@mallhub/ui';
import { Link } from 'react-router';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import { StoreRegisterForm } from '@/features/store-admin-local/auth/components/store-register-form';
import { localizeHref } from '@/paraglide/runtime.js';

export const meta = () => [
	{ title: 'Registrar tienda' },
	{
		name: 'description',
		content: 'Alta de tienda para el panel local (simulado).',
	},
];

export default function StoreLocalRegisterRoute() {
	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						Registrar tienda
					</h2>
					<p className="text-sm text-muted-foreground">
						Tras el registro simulado se fija la tienda activa y se te dirige al
						acceso para iniciar sesión en MallHub. Correos con{' '}
						<code className="text-xs">error@</code> fuerzan error.
					</p>
				</div>
				<Separator />
				<StoreRegisterForm />
				<p className="text-center text-sm text-muted-foreground">
					¿Ya tienes cuenta?{' '}
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to={localizeHref('/store-local/login')} />}
					>
						Ir al acceso
					</Button>
				</p>
			</div>
		</AuthLayout>
	);
}
