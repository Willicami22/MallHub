import { signIn } from '@/features/better-auth/better-auth-client.lib';
import type {
	PasswordResetRequest,
	RegisterStorePayload,
	StoreLocalCredentials,
} from '@/features/store-admin-local/auth/types';
import {
	mockLatency,
	shouldMockFail,
} from '@/features/store-admin-local/shared/lib/mock-api.lib';
import type { Store } from '@/features/store-admin-local/shared/types/domain.models';
import { ServiceError } from '@/features/store-admin-local/shared/types/service-error.types';
import { localizeHref } from '@/paraglide/runtime.js';

const MOCK_STORE_SEED: Store = {
	id: 'store_seed_1',
	slug: 'demo-boutique',
	name: 'Boutique Demo',
	description: 'Tienda de ejemplo para el panel local.',
	status: 'active',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

/**
 * Auth + onboarding operations for Store Admin.
 * `signInWithEmailPassword` delegates to Better Auth (platform session).
 * Replace mock branches with Supabase RPC when wiring the backend.
 */
export const authService = {
	async signInWithEmailPassword(
		input: StoreLocalCredentials,
		options?: { callbackPath?: string },
	): Promise<void> {
		if (shouldMockFail(input.email)) {
			throw new ServiceError('Credenciales inválidas (simulación).', {
				code: 'UNAUTHORIZED',
				status: 401,
			});
		}

		const callbackURL =
			typeof window !== 'undefined'
				? `${window.location.origin}${localizeHref(options?.callbackPath ?? '/store-local/dashboard')}`
				: undefined;

		const result = await signIn.email({
			email: input.email.trim(),
			password: input.password,
			...(callbackURL ? { callbackURL } : {}),
		});

		if (result.error) {
			throw new ServiceError(
				result.error.message ?? 'Error al iniciar sesión',
				{
					code: 'UNAUTHORIZED',
					status: 401,
				},
			);
		}
	},

	async registerMerchantStore(
		input: RegisterStorePayload,
	): Promise<{ store: Store }> {
		await mockLatency(500);

		if (shouldMockFail(input.ownerEmail)) {
			throw new ServiceError('No se pudo registrar la tienda (simulación).', {
				code: 'UNKNOWN',
			});
		}

		const store: Store = {
			...MOCK_STORE_SEED,
			id: `store_${crypto.randomUUID()}`,
			slug: input.slug,
			name: input.storeName,
			updatedAt: new Date().toISOString(),
		};

		return { store };
	},

	async requestPasswordReset(_input: PasswordResetRequest): Promise<void> {
		await mockLatency(400);
		// Integración futura: Supabase auth.resetPasswordForEmail o flujo propio
	},
};
