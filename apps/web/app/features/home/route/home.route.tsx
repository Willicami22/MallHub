import { Button, Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { useTRPC } from '@/features/trpc/trpc.context';
import type { Route } from './+types/home.route';

export const meta = ({ location: _location }: Route.MetaArgs) => [
	{ title: 'Home' },
	{ name: 'description', content: 'Proyecto base listo para empezar.' },
];

export default function HomeRoute() {
	const trpc = useTRPC();
	const { data, isLoading, error } = useQuery(trpc.health.queryOptions());

	return (
		<div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl items-center justify-center p-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Home</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						Base limpia lista para construir la nueva lógica de negocio.
					</p>
					<p className="text-sm text-muted-foreground">
						tRPC status:{' '}
						{isLoading
							? 'cargando...'
							: error
								? 'error'
								: (data?.status ?? 'sin respuesta')}
					</p>
					<div className="flex flex-wrap gap-2">
						<Button render={<Link to="/auth/login" />}>Iniciar sesión</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
