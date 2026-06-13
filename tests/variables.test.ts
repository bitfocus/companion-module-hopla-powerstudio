import assert from 'node:assert/strict'
import test from 'node:test'
import { UpdateVariableDefinitions, UpdateVariableValues, type VariablesSchema } from '../src/variables.js'
import type ModuleInstance from '../src/main.js'
import type { PlayoutPlayerModel, PowerStudioState } from '../src/types.js'

test('variable definitions include trigger-friendly variables', () => {
	const definitions = getVariableDefinitions()

	assert.equal(definitions.connection_ok?.name, 'Connection is OK')
	assert.equal(definitions.any_player_playing?.name, 'Any player playing')
	assert.equal(definitions.any_cart_playing?.name, 'Any cart playing')
	assert.equal(definitions.active_player?.name, 'First playing player')
	assert.equal(definitions.current_track_title?.name, 'Current track title')
	assert.equal(definitions.next_player?.name, 'Next player')
	assert.equal(definitions.next_track_title?.name, 'Next track title')
	assert.equal(definitions.last_detected_power_studio_version?.name, 'Last detected Power Studio version')
	assert.equal(definitions.last_detected_power_studio_build?.name, 'Last detected Power Studio build')
	assert.equal(definitions.parsed_power_studio_version?.name, 'Parsed Power Studio version')
	assert.equal(definitions.power_studio_minimum_supported_version?.name, 'Minimum supported Power Studio version')
	assert.equal(definitions.power_studio_version_supported?.name, 'Power Studio version is supported')
	assert.equal(definitions.enabled_capabilities?.name, 'Enabled capabilities')
	assert.equal(definitions.recorder_file_name?.name, 'Recorder file name')
	assert.equal(definitions.recorder_position?.name, 'Recorder position in seconds')
	assert.equal(definitions.recorder_duration?.name, 'Recorder duration in seconds')
	assert.equal(definitions.recorder_can_change_processing_profile?.name, 'Recorder can change processing profile')
	assert.equal(definitions.last_detected_version, undefined)
	assert.equal(definitions.last_detected_build, undefined)
	assert.equal(definitions.detected_power_studio_version, undefined)
	assert.equal(definitions.detected_power_studio_build, undefined)
	assert.equal(definitions.api_version_detected, undefined)
	assert.equal(definitions.api_minimum_supported_version, undefined)
	assert.equal(definitions.api_supported, undefined)
	assert.equal(definitions.api_capabilities, undefined)
})

test('mix editor variables use Previous before Next order', () => {
	const keys = Object.keys(getVariableDefinitions())

	assert.ok(keys.indexOf('mix_editor_can_go_previous_mix') < keys.indexOf('mix_editor_can_go_next_mix'))
})

test('variable values expose trigger-friendly aggregate and selected track state', () => {
	const values = getVariableValues({
		playout: {
			players: [
				player({ title: 'Idle', artist: 'None', playing: false, isNextItem: false, trackId: 10 }),
				player({ title: 'On Air', artist: 'Current Artist', playing: true, isNextItem: false, trackId: 20 }),
				player({ title: 'Coming Up', artist: 'Next Artist', playing: false, isNextItem: true, trackId: 30 }),
			],
		},
		carts: {
			carts: [
				{ duration: 0, playing: false, position: 0 },
				{ duration: 5, playing: true, position: 2 },
			],
		},
		recorder: {
			canChangeProcessingProfile: true,
			canPlay: false,
			canStartRecord: true,
			canStop: true,
			duration: 120,
			fileName: 'Demo recording.wav',
			playing: false,
			position: 12,
			recording: true,
			stopped: false,
		},
	})

	assert.equal(values.connection_ok, true)
	assert.equal(values.any_player_playing, true)
	assert.equal(values.active_player, 'Player B')
	assert.equal(values.current_track_id, 20)
	assert.equal(values.current_track_artist, 'Current Artist')
	assert.equal(values.current_track_title, 'On Air')
	assert.equal(values.next_player, 'Player C')
	assert.equal(values.next_track_id, 30)
	assert.equal(values.next_track_artist, 'Next Artist')
	assert.equal(values.next_track_title, 'Coming Up')
	assert.equal(values.any_cart_playing, true)
	assert.equal(values.active_cart, 'Cart B')
	assert.equal(values.recorder_file_name, 'Demo recording.wav')
	assert.equal(values.recorder_recording, true)
	assert.equal(values.recorder_position, 12)
	assert.equal(values.recorder_duration, 120)
	assert.equal(values.recorder_can_change_processing_profile, true)
})

test('version variables distinguish current connection from last detected version', () => {
	const state: PowerStudioState = {
		version: { version: '1.25.0', build: '1234' },
		lastDetectedVersion: { version: '1.25.0', build: '1234' },
	}

	const connectedValues = getVariableValues(state, true)
	const disconnectedValues = getVariableValues(state, false)

	assert.equal(connectedValues.version, '1.25.0')
	assert.equal(connectedValues.build, '1234')
	assert.equal(connectedValues.last_detected_power_studio_version, '1.25.0')
	assert.equal(connectedValues.last_detected_power_studio_build, '1234')
	assert.equal(disconnectedValues.version, '')
	assert.equal(disconnectedValues.build, '')
	assert.equal(disconnectedValues.last_detected_power_studio_version, '1.25.0')
	assert.equal(disconnectedValues.last_detected_power_studio_build, '1234')
	assert.equal(disconnectedValues.last_detected_version, undefined)
	assert.equal(disconnectedValues.last_detected_build, undefined)
	assert.equal(disconnectedValues.detected_power_studio_version, undefined)
	assert.equal(disconnectedValues.detected_power_studio_build, undefined)
})

test('Power Studio compatibility variables use Power Studio naming instead of API naming', () => {
	const values = getVariableValues({
		capabilities: {
			apiVersion: { major: 1, minor: 25, patch: 0, raw: '1.25.0' },
			apiVersionText: '1.25.0',
			minimumSupportedVersion: '1.24.1',
			supportedApiVersion: true,
			supportedLabels: ['Playout state', 'Carts'],
			features: {
				applicationStatus: true,
				playoutState: true,
				playoutCommands: true,
				playoutMode: true,
				playlist: true,
				carts: true,
				mixEditor: true,
				recorder: true,
			},
			fingerprint: '1.25.0:test',
		},
	})

	assert.equal(values.parsed_power_studio_version, '1.25.0')
	assert.equal(values.power_studio_minimum_supported_version, '1.24.1')
	assert.equal(values.power_studio_version_supported, true)
	assert.equal(values.enabled_capabilities, 'Playout state, Carts')
	assert.equal(values.api_version_detected, undefined)
	assert.equal(values.api_minimum_supported_version, undefined)
	assert.equal(values.api_supported, undefined)
	assert.equal(values.api_capabilities, undefined)
})

function getVariableDefinitions(): Record<string, { name: string }> {
	let definitions: Record<string, { name: string }> | undefined

	const self = {
		state: {},
		setVariableDefinitions: (value: Record<string, { name: string }>) => {
			definitions = value
		},
	} as unknown as ModuleInstance

	UpdateVariableDefinitions(self)

	assert.ok(definitions)
	return definitions
}

function getVariableValues(state: PowerStudioState, connectionOk = true): VariablesSchema {
	let values: VariablesSchema | undefined

	const self = {
		state,
		isConnectionOk: () => connectionOk,
		getPlaylistWindowOffset: () => 0,
		getPlaylistWindowItems: () => [],
		setVariableValues: (value: VariablesSchema) => {
			values = value
		},
	} as unknown as ModuleInstance

	UpdateVariableValues(self, 'Connected')

	assert.ok(values)
	return values
}

function player(overrides: Partial<PlayoutPlayerModel> = {}): PlayoutPlayerModel {
	return {
		artist: 'Artist',
		cued: false,
		duration: 180,
		id: 1,
		intro: 0,
		isNextItem: false,
		pfl: false,
		playing: false,
		position: 0,
		title: 'Title',
		trackId: 1,
		...overrides,
	}
}
