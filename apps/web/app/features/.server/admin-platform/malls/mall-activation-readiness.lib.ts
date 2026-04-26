export const mallActivationRequirementCodes = [
	'NAME',
	'CITY',
	'ADDRESS',
	'ADMIN_CC_ASSIGNED',
] as const;

export type MallActivationRequirementCode =
	(typeof mallActivationRequirementCodes)[number];

type MallActivationReadinessInput = {
	name: string;
	city: string;
	address: string;
	adminCcUserId: string | null;
};

type MallActivationReadiness = {
	isReady: boolean;
	missingRequirements: MallActivationRequirementCode[];
};

const hasText = (value: string): boolean => value.trim().length > 0;

export const getMallActivationReadiness = ({
	name,
	city,
	address,
	adminCcUserId,
}: MallActivationReadinessInput): MallActivationReadiness => {
	const missingRequirements: MallActivationRequirementCode[] = [];

	if (!hasText(name)) {
		missingRequirements.push('NAME');
	}

	if (!hasText(city)) {
		missingRequirements.push('CITY');
	}

	if (!hasText(address)) {
		missingRequirements.push('ADDRESS');
	}

	if (!adminCcUserId) {
		missingRequirements.push('ADMIN_CC_ASSIGNED');
	}

	return {
		isReady: missingRequirements.length === 0,
		missingRequirements,
	};
};
