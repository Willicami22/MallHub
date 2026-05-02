import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/store-admin-local/auth/services/auth.service';
import type { PasswordResetRequest } from '@/features/store-admin-local/auth/types';

export function usePasswordResetRequest() {
	return useMutation({
		mutationFn: (payload: PasswordResetRequest) =>
			authService.requestPasswordReset(payload),
	});
}
