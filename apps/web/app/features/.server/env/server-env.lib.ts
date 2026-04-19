import 'dotenv/config';

const requiredServerEnvKeys = [
	'DATABASE_URL',
	'BETTER_AUTH_URL',
	'BETTER_AUTH_SECRET',
	'ADMIN_EMAIL',
	'ADMIN_NAME',
	'ADMIN_PASSWORD',
	'REDIS_URL',
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_SECURE',
	'SMTP_FROM_EMAIL',
	'NOTIFICATIONS_WORKER_CONCURRENCY',
	'NOTIFICATIONS_WORKER_LIMIT_MAX',
	'NOTIFICATIONS_WORKER_LIMIT_DURATION_MS',
] as const;

const optionalServerEnvKeys = [
	'SMTP_USER',
	'SMTP_PASSWORD',
	'SMTP_FROM_NAME',
] as const;

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

const parseBooleanEnv = (key: RequiredServerEnvKey): boolean => {
	const value = readRequiredStringEnv(key);
	if (value === 'true') {
		return true;
	}
	if (value === 'false') {
		return false;
	}

	throw new Error(
		`Invalid boolean environment variable: ${key}. Expected "true" or "false".`,
	);
};

export const serverEnv = Object.freeze({
	DATABASE_URL: readRequiredStringEnv('DATABASE_URL'),
	BETTER_AUTH_URL: readRequiredStringEnv('BETTER_AUTH_URL'),
	BETTER_AUTH_SECRET: readRequiredStringEnv('BETTER_AUTH_SECRET'),
	ADMIN_EMAIL: readRequiredStringEnv('ADMIN_EMAIL'),
	ADMIN_NAME: readRequiredStringEnv('ADMIN_NAME'),
	ADMIN_PASSWORD: readRequiredStringEnv('ADMIN_PASSWORD'),
	REDIS_URL: readRequiredStringEnv('REDIS_URL'),
	SMTP_HOST: readRequiredStringEnv('SMTP_HOST'),
	SMTP_PORT: parseIntegerEnv('SMTP_PORT'),
	SMTP_SECURE: parseBooleanEnv('SMTP_SECURE'),
	SMTP_USER: readOptionalStringEnv('SMTP_USER'),
	SMTP_PASSWORD: readOptionalStringEnv('SMTP_PASSWORD'),
	SMTP_FROM_EMAIL: readRequiredStringEnv('SMTP_FROM_EMAIL'),
	SMTP_FROM_NAME: readOptionalStringEnv('SMTP_FROM_NAME'),
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
