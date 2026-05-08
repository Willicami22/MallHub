/** Simulated latency for mocked Supabase / RPC calls */
export const mockLatency = (ms = 420) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

/** Occasionally fails to exercise error UI (deterministic by email prefix) */
export const shouldMockFail = (seed: string) =>
	seed.toLowerCase().includes('error@');
