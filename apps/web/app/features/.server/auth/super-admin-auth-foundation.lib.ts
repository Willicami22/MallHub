import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';

export const superAdminSecureAccessRole = appRoles.ADMIN_PLATFORM;

export const superAdminAuthFoundationContract = {
	twoFactor: {
		strategy: 'better-auth-native',
		requiredForRole: superAdminSecureAccessRole,
		requiredMethods: ['totp', 'backup-codes'] as const,
	},
	passwordRecovery: {
		strategy: 'better-auth-native',
		requiredForRole: superAdminSecureAccessRole,
		requiredPrimitives: [
			'reset-token',
			'token-expiration',
			'single-use-token',
		] as const,
	},
	persistence: {
		userSecretStore: {
			totpSecretCiphertext: 'required',
			totpEnabledAt: 'required',
			recoveryCodesHash: 'required',
		},
		recoveryTokenStore: {
			tokenHash: 'required',
			expiresAt: 'required',
			consumedAt: 'required',
		},
	},
	enforcement: {
		loginPolicy: 'block-session-until-two-factor-complete',
		routePolicy: 'deny-admin-platform-without-two-factor',
	},
} as const;

export type SuperAdminAuthFoundationContract =
	typeof superAdminAuthFoundationContract;
