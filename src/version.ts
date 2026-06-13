export type ApiVersion = {
	major: number
	minor: number
	patch: number
	raw: string
}

export function parseApiVersion(value: string | undefined): ApiVersion | undefined {
	if (!value) {
		return undefined
	}

	const match = value.match(/(\d+)\.(\d+)(?:\.(\d+))?/)

	if (!match) {
		return undefined
	}

	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: match[3] === undefined ? 0 : Number(match[3]),
		raw: value,
	}
}

export function compareApiVersions(left: ApiVersion, right: ApiVersion): number {
	return left.major - right.major || left.minor - right.minor || left.patch - right.patch
}

export function isAtLeastApiVersion(actual: ApiVersion, minimum: ApiVersion): boolean {
	return compareApiVersions(actual, minimum) >= 0
}

export function formatApiVersion(version: ApiVersion | undefined): string {
	if (!version) {
		return 'unknown'
	}

	return `${version.major}.${version.minor}.${version.patch}`
}
