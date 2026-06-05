import assert from 'node:assert/strict'
import test from 'node:test'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { defaultConfig, type ModuleConfig } from '../src/config.js'
import { UpdateFeedbacks } from '../src/feedbacks.js'
import type ModuleInstance from '../src/main.js'
import type { ModuleSchema } from '../src/main.js'
import type { PlayoutPlayerModel, PowerStudioState } from '../src/types.js'

type FeedbackDefinitions = CompanionFeedbackDefinitions<ModuleSchema['feedbacks']>
type FeedbackCallback = () => boolean
type FeedbackCallbackWithOptions<TOptions, TResult = boolean> = (feedback: { options: TOptions }) => TResult

function getFeedbackDefinitions(
	connectionOk: boolean,
	state: PowerStudioState = {},
	config: ModuleConfig = defaultConfig(),
	label = 'hopla-power-studio',
): FeedbackDefinitions {
	let definitions: FeedbackDefinitions | undefined

	const self = {
		label,
		config,
		state,
		isConnectionOk: () => connectionOk,
		getPlaylistWindowItems: () => [],
		setFeedbackDefinitions: (value: FeedbackDefinitions) => {
			definitions = value
		},
	} as unknown as ModuleInstance

	UpdateFeedbacks(self)

	assert.ok(definitions)
	return definitions
}

function getFeedbackCallback<TOptions = Record<string, never>>(
	definitions: FeedbackDefinitions,
	feedbackId: keyof FeedbackDefinitions,
): FeedbackCallbackWithOptions<TOptions> {
	const definition = definitions[feedbackId]

	assert.ok(definition && typeof definition === 'object')
	return definition.callback as unknown as FeedbackCallbackWithOptions<TOptions>
}

function getAdvancedFeedbackCallback<TOptions>(
	definitions: FeedbackDefinitions,
	feedbackId: keyof FeedbackDefinitions,
): FeedbackCallbackWithOptions<TOptions, { text?: string }> {
	const definition = definitions[feedbackId]

	assert.ok(definition && typeof definition === 'object')
	return definition.callback as unknown as FeedbackCallbackWithOptions<TOptions, { text?: string }>
}

test('connection_lost feedback is true when the Companion connection is not OK', () => {
	const definitions = getFeedbackDefinitions(false)
	const callback = getFeedbackCallback(definitions, 'connection_lost') as FeedbackCallback

	assert.equal(callback(), true)
})

test('connection_lost feedback is false when the Companion connection is OK', () => {
	const definitions = getFeedbackDefinitions(true)
	const callback = getFeedbackCallback(definitions, 'connection_lost') as FeedbackCallback

	assert.equal(callback(), false)
})

test('connection_ok feedback follows the Companion connection state', () => {
	const disconnectedDefinitions = getFeedbackDefinitions(false)
	const connectedDefinitions = getFeedbackDefinitions(true)
	const disconnectedCallback = getFeedbackCallback(disconnectedDefinitions, 'connection_ok') as FeedbackCallback
	const connectedCallback = getFeedbackCallback(connectedDefinitions, 'connection_ok') as FeedbackCallback

	assert.equal(disconnectedCallback(), false)
	assert.equal(connectedCallback(), true)
})

test('aggregate player and cart feedbacks are true when any matching item is active', () => {
	const definitions = getFeedbackDefinitions(true, {
		playout: {
			players: [player({ playing: false, title: 'First' }), player({ playing: true, title: 'Second' })],
		},
		carts: {
			carts: [
				{ duration: 0, playing: false, position: 0 },
				{ duration: 5, playing: true, position: 2 },
			],
		},
	})
	const anyPlayerPlaying = getFeedbackCallback(definitions, 'any_player_playing') as FeedbackCallback
	const anyCartPlaying = getFeedbackCallback(definitions, 'any_cart_playing') as FeedbackCallback

	assert.equal(anyPlayerPlaying(), true)
	assert.equal(anyCartPlaying(), true)
})

test('player loaded and empty feedbacks expose trigger-friendly player state', () => {
	const definitions = getFeedbackDefinitions(true, {
		playout: {
			players: [player({ title: 'Loaded', trackId: 123 }), player({ title: '', artist: '', duration: 0, trackId: 0 })],
		},
	})
	const playerLoaded = getFeedbackCallback<{ player: number }>(definitions, 'player_loaded')
	const playerEmpty = getFeedbackCallback<{ player: number }>(definitions, 'player_empty')

	assert.equal(playerLoaded({ options: { player: 0 } }), true)
	assert.equal(playerLoaded({ options: { player: 1 } }), false)
	assert.equal(playerEmpty({ options: { player: 0 } }), false)
	assert.equal(playerEmpty({ options: { player: 1 } }), true)
})

test('recorder state feedback follows Recorder API booleans', () => {
	const definitions = getFeedbackDefinitions(true, {
		recorder: {
			canChangeProcessingProfile: true,
			canPlay: false,
			canStartRecord: true,
			canStop: true,
			duration: 90,
			fileName: 'Recorder.wav',
			playing: false,
			position: 10,
			recording: true,
			stopped: false,
		},
	})
	const callback = getFeedbackCallback<{ state: 'recording' | 'canPlay' }>(definitions, 'recorder_state')

	assert.equal(callback({ options: { state: 'recording' } }), true)
	assert.equal(callback({ options: { state: 'canPlay' } }), false)
})

test('cart rack preset text feedback follows the cart title visibility setting', () => {
	const hiddenDefinitions = getFeedbackDefinitions(true, {}, { ...defaultConfig(), showCartRackPresetTitles: false })
	const visibleDefinitions = getFeedbackDefinitions(true, {}, { ...defaultConfig(), showCartRackPresetTitles: true })
	const hiddenCallback = getAdvancedFeedbackCallback<{ cartPlayerIndex: number; rackSlot: number }>(
		hiddenDefinitions,
		'cart_rack_preset_text',
	)
	const visibleCallback = getAdvancedFeedbackCallback<{ cartPlayerIndex: number; rackSlot: number }>(
		visibleDefinitions,
		'cart_rack_preset_text',
	)

	assert.deepEqual(hiddenCallback({ options: { cartPlayerIndex: 0, rackSlot: 1 } }), { text: 'CART A:1' })
	assert.deepEqual(visibleCallback({ options: { cartPlayerIndex: 0, rackSlot: 1 } }), {
		text: 'CART A:1\\n$(hopla-power-studio:cart_a_slot_1_title)',
	})
})

test('preset text feedback uses the current Companion connection label for variables', () => {
	const definitions = getFeedbackDefinitions(
		true,
		{},
		{ ...defaultConfig(), showCartRackPresetTitles: true },
		'Power_Studio',
	)
	const callback = getAdvancedFeedbackCallback<{ cartPlayerIndex: number; rackSlot: number }>(
		definitions,
		'cart_rack_preset_text',
	)

	assert.deepEqual(callback({ options: { cartPlayerIndex: 0, rackSlot: 1 } }), {
		text: 'CART A:1\\n$(Power_Studio:cart_a_slot_1_title)',
	})
})

test('player transport preset text feedback follows the player title visibility setting', () => {
	const hiddenDefinitions = getFeedbackDefinitions(
		true,
		{},
		{ ...defaultConfig(), showPlayerTransportPresetTitles: false },
	)
	const visibleDefinitions = getFeedbackDefinitions(
		true,
		{},
		{ ...defaultConfig(), showPlayerTransportPresetTitles: true },
	)
	const hiddenCallback = getAdvancedFeedbackCallback<{ player: number; transport: 'play' }>(
		hiddenDefinitions,
		'player_transport_preset_text',
	)
	const visibleCallback = getAdvancedFeedbackCallback<{ player: number; transport: 'play' }>(
		visibleDefinitions,
		'player_transport_preset_text',
	)

	assert.deepEqual(hiddenCallback({ options: { player: 0, transport: 'play' } }), { text: 'PLAY A' })
	assert.deepEqual(visibleCallback({ options: { player: 0, transport: 'play' } }), {
		text: 'PLAY A\\n$(hopla-power-studio:player_a_artist)\\n$(hopla-power-studio:player_a_title)',
	})
})

test('playlist window preset text feedback follows the playlist title visibility setting', () => {
	const hiddenDefinitions = getFeedbackDefinitions(
		true,
		{},
		{ ...defaultConfig(), showPlaylistWindowPresetTitles: false },
	)
	const visibleDefinitions = getFeedbackDefinitions(
		true,
		{},
		{ ...defaultConfig(), showPlaylistWindowPresetTitles: true },
	)
	const hiddenCallback = getAdvancedFeedbackCallback<{ item: number }>(
		hiddenDefinitions,
		'playlist_window_item_preset_text',
	)
	const visibleCallback = getAdvancedFeedbackCallback<{ item: number }>(
		visibleDefinitions,
		'playlist_window_item_preset_text',
	)

	assert.deepEqual(hiddenCallback({ options: { item: 1 } }), { text: 'NEXT 1' })
	assert.deepEqual(visibleCallback({ options: { item: 1 } }), {
		text: 'NEXT 1\\n$(hopla-power-studio:playlist_item_1_artist)\\n$(hopla-power-studio:playlist_item_1_title)',
	})
})

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
