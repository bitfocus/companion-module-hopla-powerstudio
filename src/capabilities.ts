import type { VersionInfo } from './types.js'
import { formatApiVersion, isAtLeastApiVersion, parseApiVersion, type ApiVersion } from './version.js'

export const MINIMUM_SUPPORTED_API_VERSION = '1.24.1'

export type CapabilityKey =
	| 'applicationStatus'
	| 'playoutState'
	| 'playoutCommands'
	| 'playoutMode'
	| 'playlist'
	| 'carts'
	| 'mixEditor'
	| 'recorder'

export type CapabilityDefinition = {
	label: string
	minVersion: string
	enabledWhenVersionUnknown: boolean
}

export type PowerStudioCapabilities = {
	apiVersion?: ApiVersion
	apiVersionText: string
	minimumSupportedVersion: string
	supportedApiVersion: boolean
	supportedLabels: string[]
	features: Record<CapabilityKey, boolean>
	fingerprint: string
}

export const CAPABILITY_DEFINITIONS: Record<CapabilityKey, CapabilityDefinition> = {
	applicationStatus: {
		label: 'Application status',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	playoutState: {
		label: 'Playout state',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	playoutCommands: {
		label: 'Playout commands',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	playoutMode: {
		label: 'Playout mode',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	playlist: {
		label: 'Playlist',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	carts: {
		label: 'Carts',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	mixEditor: {
		label: 'Mix editor',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
	recorder: {
		label: 'Recorder',
		minVersion: MINIMUM_SUPPORTED_API_VERSION,
		enabledWhenVersionUnknown: true,
	},
}

export function buildCapabilities(versionInfo: VersionInfo | undefined): PowerStudioCapabilities {
	const apiVersion = parseApiVersion(versionInfo?.version)
	const minimumSupportedVersion = parseApiVersion(MINIMUM_SUPPORTED_API_VERSION)

	if (!minimumSupportedVersion) {
		throw new Error(`Invalid minimum API version: ${MINIMUM_SUPPORTED_API_VERSION}`)
	}

	const features = Object.fromEntries(
		Object.entries(CAPABILITY_DEFINITIONS).map(([key, definition]) => {
			const minVersion = parseApiVersion(definition.minVersion)

			if (!minVersion) {
				throw new Error(`Invalid minimum version for capability ${key}: ${definition.minVersion}`)
			}

			const enabled = apiVersion ? isAtLeastApiVersion(apiVersion, minVersion) : definition.enabledWhenVersionUnknown

			return [key, enabled]
		}),
	) as Record<CapabilityKey, boolean>

	const supportedLabels = Object.entries(features)
		.filter(([, enabled]) => enabled)
		.map(([key]) => CAPABILITY_DEFINITIONS[key as CapabilityKey].label)

	return {
		apiVersion,
		apiVersionText: formatApiVersion(apiVersion),
		minimumSupportedVersion: MINIMUM_SUPPORTED_API_VERSION,
		supportedApiVersion: apiVersion ? isAtLeastApiVersion(apiVersion, minimumSupportedVersion) : true,
		supportedLabels,
		features,
		fingerprint: `${formatApiVersion(apiVersion)}:${Object.entries(features)
			.map(([key, value]) => `${key}=${value ? 1 : 0}`)
			.join(',')}`,
	}
}

export function describeUnsupportedCapability(
	capabilities: PowerStudioCapabilities,
	capability: CapabilityKey,
): string {
	const definition = CAPABILITY_DEFINITIONS[capability]

	return `${definition.label} requires Power Studio API ${definition.minVersion} or newer. Current API version: ${capabilities.apiVersionText}.`
}

export function describeUnsupportedApiVersion(capabilities: PowerStudioCapabilities): string {
	return `Power Studio version ${capabilities.minimumSupportedVersion} or newer is required`
}
