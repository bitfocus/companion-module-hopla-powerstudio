import type { SomeCompanionConfigField } from '@companion-module/base'
import type { Protocol } from './types.js'

export const DEFAULT_REST_API_PORT = 9876
export const DEFAULT_POLL_INTERVAL = 500
export const MIN_POLL_INTERVAL = 100

export type ModuleConfig = {
	protocol: Protocol
	host: string
	port: number
	basePath: string
	username: string
	pollInterval: number
	requestTimeout: number
	showCartRackPresetTitles: boolean
	showPlayerTransportPresetTitles: boolean
	showPlaylistWindowPresetTitles: boolean
}

export type ModuleSecrets = {
	password?: string
}

export function defaultConfig(): ModuleConfig {
	return {
		protocol: 'http',
		host: '',
		port: DEFAULT_REST_API_PORT,
		basePath: '',
		username: '',
		pollInterval: DEFAULT_POLL_INTERVAL,
		requestTimeout: 3000,
		showCartRackPresetTitles: true,
		showPlayerTransportPresetTitles: true,
		showPlaylistWindowPresetTitles: true,
	}
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'protocol',
			label: 'Protocol',
			width: 3,
			default: 'http',
			choices: [
				{ id: 'http', label: 'HTTP' },
				{ id: 'https', label: 'HTTPS' },
			],
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Power Studio host',
			width: 6,
			default: '',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 3,
			default: DEFAULT_REST_API_PORT,
			min: 1,
			max: 65535,
		},
		{
			type: 'textinput',
			id: 'basePath',
			label: 'Path prefix',
			width: 6,
			default: '',
			tooltip: 'Optional path prefix, for example /powerstudio when using a reverse proxy.',
		},
		{
			type: 'textinput',
			id: 'username',
			label: 'Username',
			width: 6,
			default: '',
		},
		{
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 6,
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll interval',
			width: 6,
			default: DEFAULT_POLL_INTERVAL,
			min: MIN_POLL_INTERVAL,
			max: 60000,
			step: 50,
			tooltip:
				'Milliseconds between status polls. Lower values make button feedback react faster to Power Studio state changes.',
		},
		{
			type: 'number',
			id: 'requestTimeout',
			label: 'Request timeout',
			width: 6,
			default: 3000,
			min: 500,
			max: 30000,
			step: 100,
			tooltip: 'Milliseconds before an HTTP request is aborted.',
		},
		{
			type: 'checkbox',
			id: 'showCartRackPresetTitles',
			label: 'Show titles on cart rack presets',
			width: 4,
			default: true,
			tooltip: 'Show the current cart slot title on cart rack slot presets.',
		},
		{
			type: 'checkbox',
			id: 'showPlayerTransportPresetTitles',
			label: 'Show titles on player transport presets',
			width: 4,
			default: true,
			tooltip: 'Show live artist/title lines on Player Play, Cue and PFL presets.',
		},
		{
			type: 'checkbox',
			id: 'showPlaylistWindowPresetTitles',
			label: 'Show titles on playlist window presets',
			width: 4,
			default: true,
			tooltip: 'Show artist/title lines on playlist window item presets.',
		},
	]
}
