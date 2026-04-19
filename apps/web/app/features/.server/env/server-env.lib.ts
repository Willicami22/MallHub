import 'dotenv/config';

const requiredServerEnvKeys = [
	'DATABASE_URL',
	'BETTER_AUTH_URL',
	'BETTER_AUTH_SECRET',
	'ADMIN_EMAIL',
	'ADMIN_NAME',
	'ADMIN_PASSWORD',
	'REDIS_URL',
	'RESEND_API_KEY',
	'RESEND_FROM_EMAIL',
	'NOTIFICATIONS_WORKER_CONCURRENCY',
	'NOTIFICATIONS_WORKER_LIMIT_MAX',
	'NOTIFICATIONS_WORKER_LIMIT_DURATION_MS',
] as const;

const optionalServerEnvKeys = ['RESEND_FROM_NAME'] as const;

type RequiredServerEnvKey = (typeof requiredServerEnvKeys)[number];
type OptionalServerEnvKey = (typeof optionalServerEnvKeys)[number];

const missingServerEnvKeys = requiredServerEnvKeys.filter((key) => {
	const value = process.env[key];
	return value === undefined || value.trim().length === 0;
});

if (missingServerEnvKeys.length > 0) {
	throw new Error(
		`Missing required server environment variables: ${missingServerEnvKeys.join(', ')}`,
	);
}

const readRequiredStringEnv = (key: RequiredServerEnvKey): string => {
	const value = process.env[key];
	if (value === undefined || value.trim().length === 0) {
		throw new Error(`Missing required server environment variable: ${key}`);
	}

	return value;
};

const readOptionalStringEnv = (
	key: OptionalServerEnvKey,
): string | undefined => {
	const value = process.env[key];
	if (value === undefined) {
		return undefined;
	}

	const trimmedValue = value.trim();
	if (trimmedValue.length === 0) {
		return undefined;
	}

	return trimmedValue;
};

const parseIntegerEnv = (key: RequiredServerEnvKey): number => {
	const value = readRequiredStringEnv(key);
	const parsedValue = Number.parseInt(value, 10);
	if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
		throw new Error(
			`Invalid integer environment variable: ${key}. Expected a positive integer.`,
		);
	}

	return parsedValue;
};

export const serverEnv = Object.freeze({
	DATABASE_URL: readRequiredStringEnv('DATABASE_URL'),
	BETTER_AUTH_URL: readRequiredStringEnv('BETTER_AUTH_URL'),
	BETTER_AUTH_SECRET: readRequiredStringEnv('BETTER_AUTH_SECRET'),
	ADMIN_EMAIL: readRequiredStringEnv('ADMIN_EMAIL'),
	ADMIN_NAME: readRequiredStringEnv('ADMIN_NAME'),
	ADMIN_PASSWORD: readRequiredStringEnv('ADMIN_PASSWORD'),
	REDIS_URL: readRequiredStringEnv('REDIS_URL'),
	RESEND_API_KEY: readRequiredStringEnv('RESEND_API_KEY'),
	RESEND_FROM_EMAIL: readRequiredStringEnv('RESEND_FROM_EMAIL'),
	RESEND_FROM_NAME: readOptionalStringEnv('RESEND_FROM_NAME'),
	NOTIFICATIONS_WORKER_CONCURRENCY: parseIntegerEnv(
		'NOTIFICATIONS_WORKER_CONCURRENCY',
	),
	NOTIFICATIONS_WORKER_LIMIT_MAX: parseIntegerEnv(
		'NOTIFICATIONS_WORKER_LIMIT_MAX',
	),
	NOTIFICATIONS_WORKER_LIMIT_DURATION_MS: parseIntegerEnv(
		'NOTIFICATIONS_WORKER_LIMIT_DURATION_MS',
	),
});
