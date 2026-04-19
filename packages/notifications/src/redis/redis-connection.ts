import Redis from 'ioredis';

export interface CreateRedisConnectionOptions {
	url: string;
	keyPrefix?: string;
}

export const createRedisConnection = ({
	url,
	keyPrefix,
}: CreateRedisConnectionOptions): Redis => {
	const connection = new Redis(url, {
		maxRetriesPerRequest: null,
		enableReadyCheck: false,
		keyPrefix,
	});

	connection.on('error', (error) => {
		console.error('[notifications.redis] Connection error', {
			error,
		});
	});

	return connection;
};
