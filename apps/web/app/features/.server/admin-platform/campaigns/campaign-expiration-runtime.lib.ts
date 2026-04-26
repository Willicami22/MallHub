import { syncExpiredCampaigns } from '@/features/.server/admin-platform/campaigns/sync-expired-campaigns.lib';

const CAMPAIGN_EXPIRATION_SYNC_INTERVAL_MS = 5 * 60 * 1000;

interface CampaignExpirationRuntime {
	started: boolean;
	shutdownRegistered: boolean;
	isRunning: boolean;
	timer: NodeJS.Timeout | null;
}

const createRuntime = (): CampaignExpirationRuntime => ({
	started: false,
	shutdownRegistered: false,
	isRunning: false,
	timer: null,
});

const globalForCampaignExpirationRuntime = globalThis as typeof globalThis & {
	campaignExpirationRuntime?: CampaignExpirationRuntime;
};

const runtime =
	globalForCampaignExpirationRuntime.campaignExpirationRuntime ??
	createRuntime();

if (process.env.NODE_ENV !== 'production') {
	globalForCampaignExpirationRuntime.campaignExpirationRuntime = runtime;
}

const runCampaignExpirationSync = async (): Promise<void> => {
	if (runtime.isRunning) {
		return;
	}

	runtime.isRunning = true;

	try {
		await syncExpiredCampaigns();
	} catch (error) {
		console.error('[campaigns.expiration.runtime] Sync failed', {
			error,
		});
	} finally {
		runtime.isRunning = false;
	}
};

const stopRuntime = (): void => {
	if (runtime.timer) {
		clearInterval(runtime.timer);
		runtime.timer = null;
	}

	runtime.started = false;
};

const startRuntime = (): void => {
	if (runtime.started) {
		return;
	}

	runtime.started = true;
	void runCampaignExpirationSync();
	runtime.timer = setInterval(() => {
		void runCampaignExpirationSync();
	}, CAMPAIGN_EXPIRATION_SYNC_INTERVAL_MS);
};

if (!runtime.shutdownRegistered) {
	process.once('SIGTERM', () => {
		stopRuntime();
	});

	process.once('SIGINT', () => {
		stopRuntime();
	});

	runtime.shutdownRegistered = true;
}

export const ensureCampaignExpirationRuntime = (): void => {
	startRuntime();
};
