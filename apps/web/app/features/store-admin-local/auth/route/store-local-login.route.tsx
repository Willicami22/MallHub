import { redirect } from 'react-router';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import { localizeHref } from '@/paraglide/runtime.js';
import type { Route } from './+types/store-local-login.route';

export const meta = () => [
	{ title: 'Acceso' },
	{
		name: 'description',
		content: 'Accede al panel administrativo de tu tienda.',
	},
];

export const loader = async ({ request }: Route.LoaderArgs) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (session) {
		throw redirect(localizeHref('/store-local/dashboard'));
	}

	const loginHref = withReturnTo(
		localizeHref('/auth/login'),
		localizeHref('/store-local/dashboard'),
	);

	throw redirect(loginHref);
};

export default function StoreLocalLoginRoute() {
	return null;
}
