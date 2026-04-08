import 'dotenv/config';

const requiredServerEnvKeys = [
	'DATABASE_URL',
	'BETTER_AUTH_URL',
	'BETTER_AUTH_SECRET',
	'ADMIN_EMAIL',
	'ADMIN_NAME',
	'ADMIN_PASSWORD',
] as const;

type RequiredServerEnvKey = (typeof requiredServerEnvKeys)[number];

type ServerEnv = {
	[key in RequiredServerEnvKey]: string;
};

const missingServerEnvKeys = requiredServerEnvKeys.filter(
	(key) => process.env[key] === undefined,
);

if (missingServerEnvKeys.length > 0) {
	throw new Error(
		`Missing required server environment variables: ${missingServerEnvKeys.join(', ')}`,
	);
}

export const serverEnv = Object.freeze(
	Object.fromEntries(
		requiredServerEnvKeys.map((key) => [key, process.env[key]]),
	) as ServerEnv,
);
