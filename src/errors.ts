import { InstanceStatus } from '@companion-module/base'

export type PowerStudioRequestMethod = 'GET' | 'POST'

export type PowerStudioRequestContext = {
	method: PowerStudioRequestMethod
	path: string
	url: string
}

export type ErrorSource = 'poll' | 'command'

export type ErrorDescription = {
	message: string
	status: InstanceStatus
	logLevel: 'warn' | 'error'
	isConnectionProblem: boolean
}

const POLL_VALUES_ERROR = 'Could not retrieve values from the Power Studio REST API.'

export class PowerStudioHttpError extends Error {
	constructor(
		public readonly context: PowerStudioRequestContext,
		public readonly status: number,
		public readonly statusText: string,
		public readonly responseBody: string,
	) {
		super(buildHttpMessage(context, status, statusText, responseBody))
		this.name = 'PowerStudioHttpError'
	}
}

export class PowerStudioTimeoutError extends Error {
	constructor(
		public readonly context: PowerStudioRequestContext,
		public readonly timeoutMs: number,
	) {
		super(`${context.method} ${context.path} timed out after ${timeoutMs} ms`)
		this.name = 'PowerStudioTimeoutError'
	}
}

export class PowerStudioNetworkError extends Error {
	constructor(
		public readonly context: PowerStudioRequestContext,
		cause: unknown,
	) {
		super(`${context.method} ${context.path} failed: ${formatUnknownError(cause)}`, { cause })
		this.name = 'PowerStudioNetworkError'
	}
}

export class PowerStudioInvalidJsonError extends Error {
	constructor(
		public readonly context: PowerStudioRequestContext,
		public readonly responseBody: string,
		cause: unknown,
	) {
		super(`${context.method} ${context.path} returned invalid JSON: ${summarizeBody(responseBody)}`, { cause })
		this.name = 'PowerStudioInvalidJsonError'
	}
}

export function describePowerStudioError(error: unknown, source: ErrorSource): ErrorDescription {
	if (error instanceof PowerStudioHttpError) {
		return describeHttpError(error, source)
	}

	if (error instanceof PowerStudioTimeoutError) {
		if (source === 'poll') {
			return {
				message: `${POLL_VALUES_ERROR} Power Studio did not respond within ${error.timeoutMs} ms.`,
				status: InstanceStatus.ConnectionFailure,
				logLevel: 'error',
				isConnectionProblem: true,
			}
		}

		return {
			message: `Power Studio did not respond within ${error.timeoutMs} ms (${error.context.method} ${error.context.path}).`,
			status: InstanceStatus.ConnectionFailure,
			logLevel: 'error',
			isConnectionProblem: true,
		}
	}

	if (error instanceof PowerStudioNetworkError) {
		if (source === 'poll') {
			return {
				message: `${POLL_VALUES_ERROR} Cannot reach Power Studio at ${getOrigin(error.context.url)}.`,
				status: InstanceStatus.ConnectionFailure,
				logLevel: 'error',
				isConnectionProblem: true,
			}
		}

		return {
			message: `Cannot reach Power Studio at ${getOrigin(error.context.url)}. ${error.message}`,
			status: InstanceStatus.ConnectionFailure,
			logLevel: 'error',
			isConnectionProblem: true,
		}
	}

	if (error instanceof PowerStudioInvalidJsonError) {
		if (source === 'poll') {
			return {
				message: `${POLL_VALUES_ERROR} Power Studio returned invalid JSON.`,
				status: InstanceStatus.UnknownError,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		}

		return {
			message: `Power Studio returned invalid JSON for ${error.context.method} ${error.context.path}.`,
			status: InstanceStatus.UnknownError,
			logLevel: 'error',
			isConnectionProblem: false,
		}
	}

	if (source === 'poll') {
		return {
			message: POLL_VALUES_ERROR,
			status: InstanceStatus.ConnectionFailure,
			logLevel: 'error',
			isConnectionProblem: true,
		}
	}

	return {
		message: formatUnknownError(error),
		status: InstanceStatus.UnknownWarning,
		logLevel: 'error',
		isConnectionProblem: false,
	}
}

export function formatUnknownError(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}

	return String(error)
}

function getOrigin(url: string): string {
	try {
		return new URL(url).origin
	} catch {
		return url
	}
}

function describeHttpError(error: PowerStudioHttpError, source: ErrorSource): ErrorDescription {
	const bodySummary = summarizeBody(error.responseBody)
	const suffix = bodySummary ? ` Details: ${bodySummary}` : ''
	const requestText = `${error.context.method} ${error.context.path}`

	if (source === 'poll') {
		return describePollHttpError(error, suffix)
	}

	switch (error.status) {
		case 400:
			return {
				message: `Power Studio rejected ${requestText} as invalid.${suffix}`,
				status: InstanceStatus.UnknownWarning,
				logLevel: 'warn',
				isConnectionProblem: false,
			}
		case 401:
			return {
				message: 'Power Studio rejected the configured username or password.',
				status: InstanceStatus.AuthenticationFailure,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		case 403:
			return {
				message: `Power Studio denied permission for ${requestText}. Check user rights or IP allow lists.`,
				status: InstanceStatus.InsufficientPermissions,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		case 404:
			return {
				message: `Power Studio could not find the requested item for ${requestText}.${suffix}`,
				status: InstanceStatus.UnknownWarning,
				logLevel: 'warn',
				isConnectionProblem: false,
			}
		case 409:
			return {
				message: `Power Studio cannot perform ${requestText} in the current state.${suffix}`,
				status: InstanceStatus.UnknownWarning,
				logLevel: 'warn',
				isConnectionProblem: false,
			}
		default:
			if (error.status >= 500) {
				return {
					message: `Power Studio server error ${error.status} for ${requestText}.${suffix}`,
					status: InstanceStatus.UnknownError,
					logLevel: 'error',
					isConnectionProblem: false,
				}
			}

			return {
				message: `Power Studio returned HTTP ${error.status} ${error.statusText} for ${requestText}.${suffix}`,
				status: InstanceStatus.UnknownError,
				logLevel: 'error',
				isConnectionProblem: false,
			}
	}
}

function describePollHttpError(error: PowerStudioHttpError, suffix: string): ErrorDescription {
	switch (error.status) {
		case 400:
			return {
				message: `${POLL_VALUES_ERROR} Power Studio rejected the request as invalid.${suffix}`,
				status: InstanceStatus.UnknownError,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		case 401:
			return {
				message: `${POLL_VALUES_ERROR} Power Studio rejected the configured username or password.`,
				status: InstanceStatus.AuthenticationFailure,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		case 403:
			return {
				message: `${POLL_VALUES_ERROR} Power Studio denied permission. Check user rights or IP allow lists.`,
				status: InstanceStatus.InsufficientPermissions,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		case 404:
			return {
				message: `${POLL_VALUES_ERROR} Check host, port and path prefix.`,
				status: InstanceStatus.BadConfig,
				logLevel: 'error',
				isConnectionProblem: false,
			}
		default:
			if (error.status >= 500) {
				return {
					message: `${POLL_VALUES_ERROR} Power Studio returned server error ${error.status}.${suffix}`,
					status: InstanceStatus.UnknownError,
					logLevel: 'error',
					isConnectionProblem: false,
				}
			}

			return {
				message: `${POLL_VALUES_ERROR} Power Studio returned HTTP ${error.status} ${error.statusText}.${suffix}`,
				status: InstanceStatus.UnknownError,
				logLevel: 'error',
				isConnectionProblem: false,
			}
	}
}

function buildHttpMessage(
	context: PowerStudioRequestContext,
	status: number,
	statusText: string,
	responseBody: string,
): string {
	const bodySummary = summarizeBody(responseBody)

	return `Power Studio returned HTTP ${status} ${statusText} for ${context.method} ${context.path}${
		bodySummary ? `: ${bodySummary}` : ''
	}`
}

function summarizeBody(responseBody: string): string {
	const trimmed = responseBody.trim()

	if (!trimmed) {
		return ''
	}

	const parsed = tryParseJson(trimmed)
	const normalized = parsed ? summarizeJson(parsed) : trimmed.replace(/\s+/g, ' ')

	return normalized.length > 300 ? `${normalized.slice(0, 297)}...` : normalized
}

function tryParseJson(value: string): unknown | undefined {
	try {
		return JSON.parse(value) as unknown
	} catch {
		return undefined
	}
}

function summarizeJson(value: unknown): string {
	if (Array.isArray(value)) {
		return value.map((item) => summarizeJson(item)).join('; ')
	}

	if (value && typeof value === 'object') {
		return Object.entries(value)
			.map(([key, item]) => `${key}: ${summarizeJson(item)}`)
			.join('; ')
	}

	return String(value)
}
