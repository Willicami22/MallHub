const requiredClientEnvKeys = ['VITE_APP_API_URL'] as const;

type RequiredClientEnvKey = (typeof requiredClientEnvKeys)[number];

type ClientEnv = {
	[key in RequiredClientEnvKey]: string;
};

const getClientEnvValue = (key: RequiredClientEnvKey) => {
	return import.meta.env[key];
};

const missingClientEnvKeys = requiredClientEnvKeys.filter(
	(key) => getClientEnvValue(key) === undefined,
);

if (missingClientEnvKeys.length > 0) {
	throw new Error(
		`Missing required client environment variables: ${missingClientEnvKeys.join(', ')}`,
	);
}

export const clientEnv = Object.freeze(
	Object.fromEntries(
		requiredClientEnvKeys.map((key) => [key, getClientEnvValue(key)]),
	) as ClientEnv,
);
