export type ServiceErrorCode =
	| 'NETWORK'
	| 'UNAUTHORIZED'
	| 'NOT_FOUND'
	| 'VALIDATION'
	| 'CONFLICT'
	| 'UNKNOWN';

export class ServiceError extends Error {
	readonly code: ServiceErrorCode;
	readonly status?: number;

	constructor(
		message: string,
		options: { code: ServiceErrorCode; status?: number; cause?: unknown },
	) {
		super(message, { cause: options.cause });
		this.name = 'ServiceError';
		this.code = options.code;
		this.status = options.status;
	}
}

export const isServiceError = (value: unknown): value is ServiceError =>
	value instanceof ServiceError;
