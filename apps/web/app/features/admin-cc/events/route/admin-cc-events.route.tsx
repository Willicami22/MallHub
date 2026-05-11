import type { Route } from './+types/admin-cc-events.route';

export function meta(_args: Route.MetaArgs) {
	return [{ title: 'Eventos | Admin CC' }];
}

export default function AdminCcEventsRoute() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h1>
			<p className="text-muted-foreground">
				Programa y administra los eventos para el mall.
			</p>
			{/* CRUD de eventos */}
		</div>
	);
}
