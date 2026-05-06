import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/features/trpc/trpc.context';

export function useRegisterStore() {
	const trpc = useTRPC();

	return useMutation(trpc.storeRegistrations.create.mutationOptions());
}
