export const appendResponseHeaders = (
	targetHeaders: Headers,
	sourceHeaders: Headers,
): void => {
	sourceHeaders.forEach((value, key) => {
		if (key.toLowerCase() === 'set-cookie') {
			targetHeaders.append(key, value);
			return;
		}

		targetHeaders.set(key, value);
	});
};
