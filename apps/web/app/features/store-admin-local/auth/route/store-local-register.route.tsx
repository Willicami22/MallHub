import { Separator } from '@mallhub/ui';
import { redirect } from 'react-router';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { AuthLayout } from '@/features/better-auth/components/auth-layout';
import { StoreRegisterForm } from '@/features/store-admin-local/auth/components/store-register-form';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/store-local-register.route';

export const meta = () => [
	{ title: m.store_register_title() },
	{ name: 'description', content: m.store_register_description() },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (session) {
		throw redirect(localizeHref('/'));
	}
	return null;
};

export default function StoreLocalRegisterRoute() {
	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						{m.store_register_title()}
					</h2>
					<p className="text-sm text-muted-foreground">
						{m.store_register_description()}
					</p>
				</div>
				<Separator />
				<StoreRegisterForm />
			</div>
		</AuthLayout>
	);
}
