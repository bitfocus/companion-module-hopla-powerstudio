import assert from 'node:assert/strict'
import test from 'node:test'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { defaultConfig, type ModuleConfig } from '../src/config.js'
import { UpdatePresets } from '../src/presets.js'
import type ModuleInstance from '../src/main.js'
import type { ModuleSchema } from '../src/main.js'

const COLOR_GRAY = 0x303030
const COLOR_SLATE = 0x5f6b7a
const COLOR_BLUE = 0x0044cc
const COLOR_WHITE = 0xffffff
const COLOR_BLACK = 0x000000
const COLOR_YELLOW = 0xffcc00
const COLOR_GREEN = 0x00aa00
const COLOR_RED = 0xaa0000
const COLOR_MAGENTA = 0x990099
const COLOR_ORANGE = 0xff6600

function getPresetDefinitions(config: ModuleConfig = defaultConfig()): CompanionPresetDefinitions<ModuleSchema> {
	let presets: CompanionPresetDefinitions<ModuleSchema> | undefined

	const self = {
		config,
		state: {},
		setPresetDefinitions: (
			_structure: CompanionPresetSection<ModuleSchema>[],
			definitions: CompanionPresetDefinitions<ModuleSchema>,
		) => {
			presets = definitions
		},
	} as unknown as ModuleInstance

	UpdatePresets(self)

	assert.ok(presets)
	return presets
}

function getPresetStructure(config: ModuleConfig = defaultConfig()): CompanionPresetSection<ModuleSchema>[] {
	let structure: CompanionPresetSection<ModuleSchema>[] | undefined

	const self = {
		config,
		state: {},
		setPresetDefinitions: (
			value: CompanionPresetSection<ModuleSchema>[],
			_definitions: CompanionPresetDefinitions<ModuleSchema>,
		) => {
			structure = value
		},
	} as unknown as ModuleInstance

	UpdatePresets(self)

	assert.ok(structure)
	return structure
}

test('all presets end with connection_lost feedback so disconnected buttons become gray', () => {
	const presets = getPresetDefinitions()

	for (const [presetId, preset] of Object.entries(presets)) {
		assert.ok(preset, `${presetId} should exist`)

		const feedback = preset.feedbacks.at(-1)

		assert.equal(feedback?.feedbackId, 'connection_lost', `${presetId} should end with connection_lost`)
		assert.deepEqual(feedback?.options, {}, `${presetId} should not need options for connection_lost`)
		assert.equal(feedback?.style?.bgcolor, COLOR_GRAY, `${presetId} should become gray when disconnected`)
		assert.equal(feedback?.style?.color, COLOR_WHITE, `${presetId} should keep readable text when disconnected`)
	}
})

test('all presets use dark gray as base background while the module is disabled or restarting', () => {
	const presets = getPresetDefinitions()

	for (const [presetId, preset] of Object.entries(presets)) {
		assert.ok(preset, `${presetId} should exist`)
		assert.equal(preset.style.bgcolor, COLOR_GRAY, `${presetId} should have a neutral base background`)
	}
})

test('static blue command presets turn blue only when the connection is OK', () => {
	const presets = getPresetDefinitions()

	for (const presetId of [
		'playout_refresh',
		'playout_next_playlist',
		'mode_automation',
		'mode_live_assist',
		'mode_training',
		'mix_next_profile',
		'mix_previous_profile',
		'mix_select_profile',
		'playlist_window_previous',
		'playlist_window_next',
		'playlist_window_reset',
	]) {
		const preset = presets[presetId]
		assert.ok(preset, `${presetId} should exist`)

		const feedback = preset.feedbacks.find((entry) => entry.feedbackId === 'connection_ok')

		assert.ok(feedback, `${presetId} should have connection_ok feedback`)
		assert.deepEqual(feedback.options, {}, `${presetId} should not need options for connection_ok`)
		assert.deepEqual(feedback.style, { color: COLOR_WHITE, bgcolor: COLOR_BLUE })
	}
})

test('player presets use live status colors and omit the separate stop preset', () => {
	const presets = getPresetDefinitions()
	const playPreset = presets.playout_player_0_play
	const cuePreset = presets.playout_player_0_cue
	const pflPreset = presets.playout_player_0_pfl_toggle

	assert.equal(presets.playout_player_0_stop, undefined)
	assert.ok(playPreset)
	assert.ok(cuePreset)
	assert.ok(pflPreset)

	assert.equal(playPreset.style.bgcolor, COLOR_GRAY)
	assert.equal(cuePreset.style.bgcolor, COLOR_GRAY)
	assert.equal(pflPreset.style.bgcolor, COLOR_GRAY)
	assert.equal(playPreset.steps[0]?.down[0]?.actionId, 'player_command')
	assert.deepEqual(playPreset.steps[0]?.down[0]?.options, { player: 0, command: 'Play' })
	assert.equal(cuePreset.steps[0]?.down[0]?.actionId, 'player_cue_or_stop')
	assert.deepEqual(cuePreset.steps[0]?.down[0]?.options, { player: 0 })
	assert.deepEqual(
		playPreset.feedbacks.map((feedback) => feedback.feedbackId),
		[
			'player_loaded',
			'player_state',
			'playout_mode',
			'player_state',
			'player_empty',
			'player_transport_preset_text',
			'connection_lost',
		],
	)
	assert.deepEqual(
		cuePreset.feedbacks.map((feedback) => feedback.feedbackId),
		[
			'player_loaded',
			'player_state',
			'player_state',
			'player_empty',
			'playout_mode',
			'player_transport_preset_text',
			'connection_lost',
		],
	)
	assert.equal(cuePreset.feedbacks[0]?.style?.bgcolor, COLOR_ORANGE)
	assert.deepEqual(cuePreset.feedbacks[1]?.options, { player: 0, state: 'cued' })
	assert.equal(cuePreset.feedbacks[1]?.style?.bgcolor, COLOR_GRAY)
	assert.deepEqual(cuePreset.feedbacks[2]?.options, { player: 0, state: 'playing' })
	assert.deepEqual(playPreset.feedbacks[2]?.options, { mode: 'Automation' })
	assert.deepEqual(playPreset.feedbacks[2]?.style, { color: COLOR_WHITE, bgcolor: COLOR_GRAY })
	assert.deepEqual(playPreset.feedbacks[3]?.options, { player: 0, state: 'playing' })
	assert.deepEqual(playPreset.feedbacks[3]?.style, { color: COLOR_WHITE, bgcolor: COLOR_GREEN })
	assert.deepEqual(
		pflPreset.feedbacks.map((feedback) => feedback.feedbackId),
		['player_state', 'player_empty', 'playout_mode', 'player_transport_preset_text', 'connection_lost'],
	)
})

test('player transport title setting controls Play, Cue and PFL preset text', () => {
	const presets = getPresetDefinitions({ ...defaultConfig(), showPlayerTransportPresetTitles: false })

	assert.equal(presets.playout_player_0_play?.style.text, 'PLAY A')
	assert.equal(presets.playout_player_0_cue?.style.text, 'CUE A')
	assert.equal(presets.playout_player_0_pfl_toggle?.style.text, 'PFL A')
})

test('player transport presets show live artist and title variables by default', () => {
	const presets = getPresetDefinitions()

	assert.match(String(presets.playout_player_0_play?.style.text), /player_a_artist/)
	assert.match(String(presets.playout_player_0_play?.style.text), /player_a_title/)
	assert.match(String(presets.playout_player_0_cue?.style.text), /player_a_artist/)
	assert.match(String(presets.playout_player_0_pfl_toggle?.style.text), /player_a_title/)
})

test('player transport presets include dynamic text feedback for title setting changes', () => {
	const presets = getPresetDefinitions()

	assert.deepEqual(findFeedback(presets.playout_player_0_play, 'player_transport_preset_text')?.options, {
		player: 0,
		transport: 'play',
	})
	assert.deepEqual(findFeedback(presets.playout_player_0_cue, 'player_transport_preset_text')?.options, {
		player: 0,
		transport: 'cue',
	})
	assert.deepEqual(findFeedback(presets.playout_player_0_pfl_toggle, 'player_transport_preset_text')?.options, {
		player: 0,
		transport: 'pfl_toggle',
	})
})

test('playout control presets keep mode buttons in Automation, Live Assist, Training Mode order', () => {
	const structure = getPresetStructure()
	const playoutSection = structure.find((section) => section.id === 'playout')
	const playoutControl = playoutSection?.definitions.find(
		(definition) => typeof definition === 'object' && definition.id === 'playout-control',
	)

	assert.ok(playoutControl)
	if (typeof playoutControl !== 'object' || !('presets' in playoutControl)) {
		throw new Error('Expected playout-control to be a simple preset group')
	}
	assert.deepEqual(playoutControl.presets, [
		'playout_refresh',
		'playout_next_playlist',
		'mode_automation',
		'mode_live_assist',
		'mode_training',
	])
})

test('mix editor presets keep Previous before Next order for mix and profile navigation', () => {
	const structure = getPresetStructure()
	const mixEditorSection = structure.find((section) => section.id === 'mix-editor')
	const mixEditorControl = mixEditorSection?.definitions.find(
		(definition) => typeof definition === 'object' && definition.id === 'mix-editor-control',
	)

	assert.ok(mixEditorControl)
	if (typeof mixEditorControl !== 'object' || !('presets' in mixEditorControl)) {
		throw new Error('Expected mix-editor-control to be a simple preset group')
	}
	assert.deepEqual(mixEditorControl.presets, [
		'mix_play',
		'mix_stop',
		'mix_record',
		'mix_save',
		'mix_undo',
		'mix_previous',
		'mix_next',
		'mix_previous_profile',
		'mix_next_profile',
		'mix_select_profile',
	])
})

test('recorder presets use Recorder commands and keep Previous before Next profile order', () => {
	const structure = getPresetStructure()
	const presets = getPresetDefinitions()
	const recorderSection = structure.find((section) => section.id === 'recorder')
	const recorderControl = recorderSection?.definitions.find(
		(definition) => typeof definition === 'object' && definition.id === 'recorder-control',
	)

	assert.ok(recorderControl)
	if (typeof recorderControl !== 'object' || !('presets' in recorderControl)) {
		throw new Error('Expected recorder-control to be a simple preset group')
	}
	assert.deepEqual(recorderControl.presets, [
		'recorder_play',
		'recorder_stop',
		'recorder_record',
		'recorder_record_start',
		'recorder_record_stop',
		'recorder_previous_profile',
		'recorder_next_profile',
		'recorder_select_profile',
	])

	assert.deepEqual(presets.recorder_play?.steps[0]?.down[0], {
		actionId: 'recorder_command',
		options: { command: 'play' },
	})
	assert.deepEqual(presets.recorder_record_start?.steps[0]?.down[0], {
		actionId: 'recorder_command',
		options: { command: 'record_start' },
	})
	assert.deepEqual(presets.recorder_previous_profile?.steps[0]?.down[0], {
		actionId: 'recorder_command',
		options: { command: 'previous_profile' },
	})
})

test('recorder presets use live recorder status colors', () => {
	const presets = getPresetDefinitions()
	const playPreset = presets.recorder_play
	const stopPreset = presets.recorder_stop
	const recordPreset = presets.recorder_record
	const profilePreset = presets.recorder_previous_profile

	assert.ok(playPreset)
	assert.ok(stopPreset)
	assert.ok(recordPreset)
	assert.ok(profilePreset)
	assert.deepEqual(playPreset.feedbacks[0]?.options, { state: 'canPlay' })
	assert.deepEqual(playPreset.feedbacks[0]?.style, { color: COLOR_WHITE, bgcolor: COLOR_BLUE })
	assert.deepEqual(playPreset.feedbacks[1]?.options, { state: 'playing' })
	assert.deepEqual(playPreset.feedbacks[1]?.style, { color: COLOR_WHITE, bgcolor: COLOR_GREEN })
	assert.deepEqual(stopPreset.feedbacks[0]?.options, { state: 'playing' })
	assert.deepEqual(stopPreset.feedbacks[0]?.style, { color: COLOR_WHITE, bgcolor: COLOR_RED })
	assert.deepEqual(recordPreset.feedbacks[0]?.options, { state: 'canStartRecord' })
	assert.deepEqual(recordPreset.feedbacks[1]?.options, { state: 'recording' })
	assert.deepEqual(recordPreset.feedbacks[1]?.style, { color: COLOR_WHITE, bgcolor: COLOR_RED })
	assert.deepEqual(profilePreset.feedbacks[0]?.options, { state: 'canChangeProcessingProfile' })
	assert.deepEqual(profilePreset.feedbacks[0]?.style, { color: COLOR_WHITE, bgcolor: COLOR_BLUE })
})

test('playlist window presets use distinct colors for VoiceTrack, Misc and next item', () => {
	const presets = getPresetDefinitions()
	const preset = presets.playlist_window_item_1_set_next

	assert.ok(preset)

	const voiceTrackIndex = preset.feedbacks.findIndex((feedback) => isFeedbackOption(feedback, 'VoiceTrack'))
	const miscIndex = preset.feedbacks.findIndex((feedback) => isFeedbackOption(feedback, 'Misc'))
	const nextIndex = preset.feedbacks.findIndex((feedback) => isFeedbackOption(feedback, 'isNextItem'))

	assert.ok(voiceTrackIndex >= 0)
	assert.ok(miscIndex >= 0)
	assert.ok(nextIndex > voiceTrackIndex)
	assert.ok(nextIndex > miscIndex)
	assert.deepEqual(preset.feedbacks[voiceTrackIndex]?.style, { color: COLOR_WHITE, bgcolor: COLOR_MAGENTA })
	assert.deepEqual(preset.feedbacks[miscIndex]?.style, { color: COLOR_WHITE, bgcolor: COLOR_SLATE })
	assert.deepEqual(preset.feedbacks[nextIndex]?.style, { color: COLOR_BLACK, bgcolor: COLOR_YELLOW })
})

test('cart rack title setting controls rack slot preset text', () => {
	const presets = getPresetDefinitions({ ...defaultConfig(), showCartRackPresetTitles: false })

	assert.equal(presets.cart_a_slot_1?.style.text, 'CART A:1')
	assert.equal(presets.cart_b_slot_7?.style.text, 'CART B:7')
})

test('cart rack presets show live title variables by default', () => {
	const presets = getPresetDefinitions()

	assert.match(String(presets.cart_a_slot_1?.style.text), /cart_a_slot_1_title/)
	assert.match(String(presets.cart_b_slot_7?.style.text), /cart_b_slot_7_title/)
})

test('cart rack presets include dynamic text feedback for title setting changes', () => {
	const presets = getPresetDefinitions()

	assert.deepEqual(findFeedback(presets.cart_a_slot_1, 'cart_rack_preset_text')?.options, {
		cartPlayerIndex: 0,
		rackSlot: 1,
	})
	assert.deepEqual(findFeedback(presets.cart_b_slot_7, 'cart_rack_preset_text')?.options, {
		cartPlayerIndex: 1,
		rackSlot: 7,
	})
})

test('playlist window title setting controls item preset text', () => {
	const presets = getPresetDefinitions({ ...defaultConfig(), showPlaylistWindowPresetTitles: false })

	assert.equal(presets.playlist_window_item_1_set_next?.style.text, 'NEXT 1')
	assert.equal(presets.playlist_window_item_16_set_next?.style.text, 'NEXT 16')
})

test('playlist window item presets show live artist and title variables by default', () => {
	const presets = getPresetDefinitions()

	assert.match(String(presets.playlist_window_item_1_set_next?.style.text), /playlist_item_1_artist/)
	assert.match(String(presets.playlist_window_item_1_set_next?.style.text), /playlist_item_1_title/)
	assert.match(String(presets.playlist_window_item_16_set_next?.style.text), /playlist_item_16_title/)
})

test('playlist window item presets include dynamic text feedback for title setting changes', () => {
	const presets = getPresetDefinitions()

	assert.deepEqual(findFeedback(presets.playlist_window_item_1_set_next, 'playlist_window_item_preset_text')?.options, {
		item: 1,
	})
	assert.deepEqual(
		findFeedback(presets.playlist_window_item_16_set_next, 'playlist_window_item_preset_text')?.options,
		{
			item: 16,
		},
	)
})

function isFeedbackOption(feedback: { feedbackId: string; options: unknown }, value: string): boolean {
	if (!feedback.options || typeof feedback.options !== 'object') {
		return false
	}

	return Object.values(feedback.options).includes(value)
}

function findFeedback(
	preset: CompanionPresetDefinitions<ModuleSchema>[string] | undefined,
	feedbackId: string,
): { options: unknown } | undefined {
	return preset?.feedbacks.find((feedback) => feedback.feedbackId === feedbackId)
}
