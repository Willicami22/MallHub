import { Button, Card, CardContent, CardHeader, CardTitle } from '@mallhub/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import { useTRPC } from '@/features/trpc/trpc.context';
import type { Route } from './+types/home.route';

export const meta = ({ location: _location }: Route.MetaArgs) => [
	{ title: m.home_meta_title() },
	{ name: 'description', content: m.home_meta_description() },
];

export default function HomeRoute() {
	const trpc = useTRPC();
	const { data, isLoading, error } = useQuery(trpc.health.queryOptions());

	return (
		<div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl items-center justify-center p-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>{m.home_title()}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">{m.home_intro()}</p>
					<p className="text-sm text-muted-foreground">
						{m.home_trpc_status_label()}{' '}
						{isLoading
							? m.home_trpc_status_loading()
							: error
								? m.home_trpc_status_error()
								: (data?.status ?? m.home_trpc_status_no_response())}
					</p>
					<div className="flex flex-wrap gap-2">
						<Button render={<Link to={localizeHref('/auth/login')} />}>
							{m.home_login_cta()}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
