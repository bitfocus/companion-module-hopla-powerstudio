import type {
	CompanionPresetAction,
	CompanionPresetDefinitions,
	CompanionPresetFeedback,
	CompanionPresetSection,
	CompanionTextSize,
} from '@companion-module/base'
import { cartRackSlotTitleVariable, getCartRackItems, rackItemDisplayNumber, type CartRackItem } from './cart-rack.js'
import { moduleVariableReference, optionalModuleVariableLines } from './companion-variable.js'
import { CART_PLAYER_COUNT, PLAYER_COUNT, PLAYLIST_WINDOW_ITEM_COUNT } from './constants.js'
import {
	cartPlayerDisplayName,
	cartPlayerKey,
	cartPlayerLabel,
	playerDisplayName,
	playerLabel,
	playerVariable,
} from './labels.js'
import type ModuleInstance from './main.js'
import type { ModuleSchema } from './main.js'
import { playlistItemVariable } from './playlist-window.js'
import type { ContentTypeType, MixEditorCommand, MixEditorState, RecorderCommand, RecorderState } from './types.js'

const COLOR_BLACK = 0x000000
const COLOR_WHITE = 0xffffff
const COLOR_GREEN = 0x00aa00
const COLOR_RED = 0xaa0000
const COLOR_BLUE = 0x0044cc
const COLOR_YELLOW = 0xffcc00
const COLOR_GRAY = 0x303030
const COLOR_SLATE = 0x5f6b7a
const COLOR_ORANGE = 0xff6600
const COLOR_PURPLE = 0x663399
const COLOR_CYAN = 0x008b8b
const COLOR_MAGENTA = 0x990099
type PresetFeedback = CompanionPresetFeedback<ModuleSchema['feedbacks']>
type PresetAction = CompanionPresetAction<ModuleSchema['actions']>

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions<ModuleSchema> = {}

	const playerDefinitions = Array.from({ length: PLAYER_COUNT }, (_, player) => ({
		id: `player-${player}`,
		name: playerDisplayName(player),
		type: 'simple' as const,
		presets: addPlayerPresets(presets, self, player, self.config.showPlayerTransportPresetTitles !== false),
	}))
	const playlistWindowDefinitions = addPlaylistWindowPresets(
		presets,
		self,
		self.config.showPlaylistWindowPresetTitles !== false,
	)

	presets.playout_refresh = {
		type: 'simple',
		name: 'Refresh playout',
		style: {
			text: 'REFRESH\\nPLAYOUT',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'refresh_playout', options: {} }],
				up: [],
			},
		],
		feedbacks: [connectionOkFeedback(COLOR_WHITE, COLOR_BLUE)],
	}

	presets.playout_next_playlist = {
		type: 'simple',
		name: 'Load next playlist',
		style: {
			text: 'NEXT\\nPLAYLIST',
			size: '14',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'load_next_playlist', options: {} }],
				up: [],
			},
		],
		feedbacks: [connectionOkFeedback(COLOR_WHITE, COLOR_BLUE)],
	}

	presets.mode_automation = {
		type: 'simple',
		name: 'Automation mode',
		style: {
			text: 'AUTO',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'set_playout_mode', options: { mode: 'Automation' } }],
				up: [],
			},
		],
		feedbacks: [
			connectionOkFeedback(COLOR_WHITE, COLOR_BLUE),
			{
				feedbackId: 'playout_mode',
				options: { mode: 'Automation' },
				style: { color: COLOR_BLACK, bgcolor: COLOR_YELLOW },
			},
		],
	}

	presets.mode_live_assist = {
		type: 'simple',
		name: 'Live Assist mode',
		style: {
			text: 'LIVE\\nASSIST',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'set_playout_mode', options: { mode: 'LiveAssist' } }],
				up: [],
			},
		],
		feedbacks: [
			connectionOkFeedback(COLOR_WHITE, COLOR_BLUE),
			{
				feedbackId: 'playout_mode',
				options: { mode: 'LiveAssist' },
				style: { color: COLOR_BLACK, bgcolor: COLOR_YELLOW },
			},
		],
	}

	presets.mode_training = {
		type: 'simple',
		name: 'Training Mode',
		style: {
			text: 'TRAINING\\nMODE',
			size: '14',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'set_playout_mode', options: { mode: 'TrainingMode' } }],
				up: [],
			},
		],
		feedbacks: [
			connectionOkFeedback(COLOR_WHITE, COLOR_BLUE),
			{
				feedbackId: 'playout_mode',
				options: { mode: 'TrainingMode' },
				style: { color: COLOR_BLACK, bgcolor: COLOR_YELLOW },
			},
		],
	}

	const mixEditorPresets = addMixEditorPresets(presets)
	const recorderPresets = addRecorderPresets(presets)

	const cartRackItems = getCartRackItems(self.state.carts)
	const cartDefinitions = Array.from({ length: CART_PLAYER_COUNT }, (_, cartPlayerIndex) => {
		const rackItems = cartRackItems.filter((item) => item.cartPlayerIndex === cartPlayerIndex)

		return {
			id: `cart-${cartPlayerIndex}`,
			name: cartPlayerDisplayName(cartPlayerIndex),
			type: 'simple' as const,
			presets: addCartPresets(
				presets,
				self,
				cartPlayerIndex,
				rackItems,
				self.config.showCartRackPresetTitles !== false,
			),
		}
	})

	const structure: CompanionPresetSection<ModuleSchema>[] = [
		{
			id: 'playout',
			name: 'Playout',
			definitions: [
				...playerDefinitions,
				{
					id: 'playout-control',
					name: 'Playlist and modes',
					type: 'simple',
					presets: ['playout_refresh', 'playout_next_playlist', 'mode_automation', 'mode_live_assist', 'mode_training'],
				},
			],
		},
		{
			id: 'mix-editor',
			name: 'Mix Editor',
			definitions: [
				{
					id: 'mix-editor-control',
					name: 'Transport',
					type: 'simple',
					presets: mixEditorPresets,
				},
			],
		},
		{
			id: 'recorder',
			name: 'Recorder',
			definitions: [
				{
					id: 'recorder-control',
					name: 'Transport',
					type: 'simple',
					presets: recorderPresets,
				},
			],
		},
		{
			id: 'playlist-window',
			name: 'Playlist Window',
			definitions: playlistWindowDefinitions,
		},
		{
			id: 'carts',
			name: 'Carts',
			definitions: cartDefinitions,
		},
	]

	addConnectionLostFeedbacks(presets)
	self.setPresetDefinitions(structure, presets)
}

function addConnectionLostFeedbacks(presets: CompanionPresetDefinitions<ModuleSchema>): void {
	for (const preset of Object.values(presets)) {
		if (!preset) {
			continue
		}

		preset.feedbacks = [...preset.feedbacks, connectionLostFeedback()]
	}
}

function connectionLostFeedback(): PresetFeedback {
	return {
		feedbackId: 'connection_lost',
		options: {},
		style: { color: COLOR_WHITE, bgcolor: COLOR_GRAY },
	}
}

function connectionOkFeedback(color: number, bgcolor: number): PresetFeedback {
	return {
		feedbackId: 'connection_ok',
		options: {},
		style: { color, bgcolor },
	}
}

function addPlaylistWindowPresets(
	presets: CompanionPresetDefinitions<ModuleSchema>,
	self: ModuleInstance,
	showTitles: boolean,
): CompanionPresetSection<ModuleSchema>['definitions'] {
	const itemPresetIds = Array.from({ length: PLAYLIST_WINDOW_ITEM_COUNT }, (_, index) => {
		const item = index + 1
		const presetId = `playlist_window_item_${item}_set_next`

		presets[presetId] = playlistWindowItemPreset(self, item, showTitles)

		return presetId
	})
	const previousId = 'playlist_window_previous'
	const nextId = 'playlist_window_next'
	const resetId = 'playlist_window_reset'

	presets[previousId] = playlistWindowControlPreset(
		self,
		'Previous playlist window',
		'PREV\\nWINDOW',
		'playlist_window_previous',
	)
	presets[nextId] = playlistWindowControlPreset(self, 'Next playlist window', 'NEXT\\nWINDOW', 'playlist_window_next')
	presets[resetId] = playlistWindowControlPreset(
		self,
		'Reset playlist window',
		'RESET\\nWINDOW',
		'playlist_window_reset',
	)

	return [
		{
			id: 'playlist-window-items-1',
			name: 'Visible items 1-8',
			type: 'simple',
			presets: itemPresetIds.slice(0, 8),
		},
		{
			id: 'playlist-window-items-2',
			name: 'Visible items 9-16',
			type: 'simple',
			presets: itemPresetIds.slice(8),
		},
		{
			id: 'playlist-window-navigation',
			name: 'Window navigation',
			type: 'simple',
			presets: [previousId, nextId, resetId],
		},
	]
}

function playlistWindowItemPreset(
	self: ModuleInstance,
	item: number,
	showTitles: boolean,
): CompanionPresetDefinitions<ModuleSchema>[string] {
	const artistVariable = playlistItemVariable(item, 'artist')
	const titleVariable = playlistItemVariable(item, 'title')

	return {
		type: 'simple',
		name: `Set next playlist window item ${item}`,
		style: {
			text: optionalModuleVariableLines(self, `NEXT ${item}`, showTitles, [artistVariable, titleVariable]),
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'set_next_playlist_window_item', options: { item } }],
				up: [],
			},
		],
		feedbacks: [
			playlistContentTypeFeedback(item, 'Track', COLOR_WHITE, COLOR_BLUE),
			playlistContentTypeFeedback(item, 'Jingle', COLOR_WHITE, COLOR_PURPLE),
			playlistContentTypeFeedback(item, 'Promo', COLOR_WHITE, COLOR_CYAN),
			playlistContentTypeFeedback(item, 'Spot', COLOR_WHITE, COLOR_ORANGE),
			playlistContentTypeFeedback(item, 'VoiceTrack', COLOR_WHITE, COLOR_MAGENTA),
			playlistContentTypeFeedback(item, 'Misc', COLOR_WHITE, COLOR_SLATE),
			playlistItemStateFeedback(item, 'isNextItem', COLOR_BLACK, COLOR_YELLOW),
			playlistItemStateFeedback(item, 'isPlaying', COLOR_WHITE, COLOR_GREEN),
			playlistWindowItemPresetTextFeedback(item),
		],
	}
}

function playlistWindowControlPreset(
	self: ModuleInstance,
	name: string,
	text: string,
	actionId: 'playlist_window_previous' | 'playlist_window_next' | 'playlist_window_reset',
): CompanionPresetDefinitions<ModuleSchema>[string] {
	return {
		type: 'simple',
		name,
		style: {
			text: `${text}\\n${moduleVariableReference(self, 'playlist_window_first_item')}`,
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId, options: {} }],
				up: [],
			},
		],
		feedbacks: [connectionOkFeedback(COLOR_WHITE, COLOR_BLUE)],
	}
}

function playlistContentTypeFeedback(
	item: number,
	contentType: ContentTypeType,
	color: number,
	bgcolor: number,
): PresetFeedback {
	return {
		feedbackId: 'playlist_item_content_type',
		options: { item, contentType },
		style: { color, bgcolor },
	}
}

function playlistItemStateFeedback(
	item: number,
	state: 'hasItem' | 'isPlaying' | 'isNextItem',
	color: number,
	bgcolor: number,
): PresetFeedback {
	return {
		feedbackId: 'playlist_item_state',
		options: { item, state },
		style: { color, bgcolor },
	}
}

function playlistWindowItemPresetTextFeedback(item: number): PresetFeedback {
	return {
		feedbackId: 'playlist_window_item_preset_text',
		options: { item },
	}
}

function addPlayerPresets(
	presets: CompanionPresetDefinitions<ModuleSchema>,
	self: ModuleInstance,
	player: number,
	showTitles: boolean,
): string[] {
	const playId = `playout_player_${player}_play`
	const cueId = `playout_player_${player}_cue`
	const pflToggleId = `playout_player_${player}_pfl_toggle`

	presets[playId] = playerTransportPreset(
		self,
		player,
		'play',
		'Play',
		'PLAY',
		showTitles,
		{ actionId: 'player_command', options: { player, command: 'Play' } },
		[
			playerLoadedFeedback(player, COLOR_WHITE, COLOR_BLUE),
			playerStateFeedback(player, 'isNextItem', COLOR_BLACK, COLOR_YELLOW),
			automationModeFeedback(),
			playerStateFeedback(player, 'playing', COLOR_WHITE, COLOR_GREEN),
			playerEmptyFeedback(player),
			playerTransportPresetTextFeedback(player, 'play'),
		],
	)
	presets[cueId] = playerTransportPreset(
		self,
		player,
		'cue',
		'Cue or stop',
		'CUE',
		showTitles,
		{ actionId: 'player_cue_or_stop', options: { player } },
		[
			playerLoadedFeedback(player, COLOR_WHITE, COLOR_ORANGE),
			playerStateFeedback(player, 'cued', COLOR_WHITE, COLOR_GRAY),
			playerStateFeedback(player, 'playing', COLOR_WHITE, COLOR_RED),
			playerEmptyFeedback(player),
			automationModeFeedback(),
			playerTransportPresetTextFeedback(player, 'cue'),
		],
	)
	presets[pflToggleId] = playerTransportPreset(
		self,
		player,
		'pfl_toggle',
		'PFL toggle',
		'PFL',
		showTitles,
		{ actionId: 'player_command', options: { player, command: 'PflToggle' } },
		[
			playerStateFeedback(player, 'pfl', COLOR_BLACK, COLOR_YELLOW),
			playerEmptyFeedback(player),
			automationModeFeedback(),
			playerTransportPresetTextFeedback(player, 'pfl_toggle'),
		],
	)

	return [playId, cueId, pflToggleId]
}

function playerTransportPreset(
	self: ModuleInstance,
	player: number,
	commandId: string,
	commandName: string,
	buttonText: string,
	showTitles: boolean,
	action: PresetAction,
	feedbacks: PresetFeedback[],
): CompanionPresetDefinitions<ModuleSchema>[typeof commandId] {
	const artistVariable = playerVariable(player, 'artist')
	const titleVariable = playerVariable(player, 'title')

	return {
		type: 'simple',
		name: `${playerDisplayName(player)} ${commandName}`,
		style: {
			text: optionalModuleVariableLines(self, `${buttonText} ${playerLabel(player)}`, showTitles, [
				artistVariable,
				titleVariable,
			]),
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [action],
				up: [],
			},
		],
		feedbacks,
	}
}

function playerLoadedFeedback(player: number, color: number, bgcolor: number): PresetFeedback {
	return {
		feedbackId: 'player_loaded',
		options: { player },
		style: { color, bgcolor },
	}
}

function playerEmptyFeedback(player: number): PresetFeedback {
	return {
		feedbackId: 'player_empty',
		options: { player },
		style: { color: COLOR_WHITE, bgcolor: COLOR_GRAY },
	}
}

function automationModeFeedback(): PresetFeedback {
	return {
		feedbackId: 'playout_mode',
		options: { mode: 'Automation' },
		style: { color: COLOR_WHITE, bgcolor: COLOR_GRAY },
	}
}

function playerStateFeedback(
	player: number,
	state: 'playing' | 'cued' | 'pfl' | 'isNextItem',
	color: number,
	bgcolor: number,
): PresetFeedback {
	return {
		feedbackId: 'player_state',
		options: { player, state },
		style: { color, bgcolor },
	}
}

function playerTransportPresetTextFeedback(player: number, transport: 'play' | 'cue' | 'pfl_toggle'): PresetFeedback {
	return {
		feedbackId: 'player_transport_preset_text',
		options: { player, transport },
	}
}

function addCartPresets(
	presets: CompanionPresetDefinitions<ModuleSchema>,
	self: ModuleInstance,
	cartPlayerIndex: number,
	rackItems: CartRackItem[],
	showTitles: boolean,
): string[] {
	const stopId = `cart_${cartPlayerKey(cartPlayerIndex)}_stop`
	const rackPresetIds = rackItems.map((item) => {
		const presetId = `cart_${cartPlayerKey(cartPlayerIndex)}_slot_${rackItemDisplayNumber(item.rackItemIndex)}`

		presets[presetId] = cartTriggerPreset(self, item, showTitles)

		return presetId
	})

	presets[stopId] = {
		type: 'simple',
		name: `Stop ${cartPlayerDisplayName(cartPlayerIndex)}`,
		style: {
			text: `CART ${cartPlayerLabel(cartPlayerIndex)}\\nSTOP`,
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'stop_cart', options: { cartPlayerIndex } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'cart_player_playing',
				options: { cartPlayerIndex },
				style: { color: COLOR_WHITE, bgcolor: COLOR_RED },
			},
		],
	}

	return [...rackPresetIds, stopId]
}

function cartTriggerPreset(
	self: ModuleInstance,
	item: CartRackItem,
	showTitles: boolean,
): CompanionPresetDefinitions<ModuleSchema>[string] {
	const titleVariable = cartRackSlotTitleVariable(item.cartPlayerIndex, item.rackItemIndex)
	const rackSlot = rackItemDisplayNumber(item.rackItemIndex)

	return {
		type: 'simple',
		name: `Trigger ${cartPlayerDisplayName(item.cartPlayerIndex)} slot ${rackSlot}`,
		style: {
			text: optionalModuleVariableLines(self, `CART ${cartPlayerLabel(item.cartPlayerIndex)}:${rackSlot}`, showTitles, [
				titleVariable,
			]),
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [
					{
						actionId: 'trigger_cart',
						options: { cartPlayerIndex: item.cartPlayerIndex, rackSlot },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'cart_slot_status',
				options: { cartPlayerIndex: item.cartPlayerIndex, rackSlot, status: 'None' },
				style: { color: COLOR_WHITE, bgcolor: COLOR_GRAY },
			},
			{
				feedbackId: 'cart_slot_status',
				options: { cartPlayerIndex: item.cartPlayerIndex, rackSlot, status: 'Loaded' },
				style: { color: COLOR_WHITE, bgcolor: COLOR_BLUE },
			},
			{
				feedbackId: 'cart_slot_status',
				options: { cartPlayerIndex: item.cartPlayerIndex, rackSlot, status: 'Selected' },
				style: { color: COLOR_BLACK, bgcolor: COLOR_YELLOW },
			},
			{
				feedbackId: 'cart_slot_status',
				options: { cartPlayerIndex: item.cartPlayerIndex, rackSlot, status: 'Playing' },
				style: { color: COLOR_WHITE, bgcolor: COLOR_GREEN },
			},
			cartRackPresetTextFeedback(item.cartPlayerIndex, rackSlot),
		],
	}
}

function cartRackPresetTextFeedback(cartPlayerIndex: number, rackSlot: number): PresetFeedback {
	return {
		feedbackId: 'cart_rack_preset_text',
		options: { cartPlayerIndex, rackSlot },
	}
}

function addMixEditorPresets(presets: CompanionPresetDefinitions<ModuleSchema>): string[] {
	const presetDefinitions: Array<{
		id: string
		name: string
		text: string
		command: MixEditorCommand
		feedbacks: PresetFeedback[]
		size?: CompanionTextSize
		bgcolor?: number
	}> = [
		{
			id: 'mix_play',
			name: 'Mix play',
			text: 'MIX\\nPLAY',
			command: 'play',
			feedbacks: [
				mixEditorStateFeedback('canPlay', COLOR_WHITE, COLOR_BLUE),
				mixEditorStateFeedback('playing', COLOR_WHITE, COLOR_GREEN),
			],
		},
		{
			id: 'mix_stop',
			name: 'Mix stop',
			text: 'MIX\\nSTOP',
			command: 'stop',
			feedbacks: [
				mixEditorStateFeedback('playing', COLOR_WHITE, COLOR_RED),
				mixEditorStateFeedback('recording', COLOR_WHITE, COLOR_RED),
				mixEditorStateFeedback('canStop', COLOR_WHITE, COLOR_RED),
			],
		},
		{
			id: 'mix_record',
			name: 'Mix record',
			text: 'MIX\\nREC',
			command: 'record',
			feedbacks: [
				mixEditorStateFeedback('canRecordMix', COLOR_WHITE, COLOR_BLUE),
				mixEditorStateFeedback('recording', COLOR_WHITE, COLOR_RED),
			],
		},
		{
			id: 'mix_save',
			name: 'Mix save',
			text: 'MIX\\nSAVE',
			command: 'save',
			feedbacks: [mixEditorStateFeedback('canSave', COLOR_WHITE, COLOR_BLUE)],
		},
		{
			id: 'mix_undo',
			name: 'Mix undo',
			text: 'MIX\\nUNDO',
			command: 'undo',
			feedbacks: [mixEditorStateFeedback('canUndo', COLOR_WHITE, COLOR_BLUE)],
		},
		{
			id: 'mix_previous',
			name: 'Previous mix',
			text: 'PREV\\nMIX',
			command: 'previousmix',
			feedbacks: [mixEditorStateFeedback('canGoPreviousMix', COLOR_WHITE, COLOR_BLUE)],
		},
		{
			id: 'mix_next',
			name: 'Next mix',
			text: 'NEXT\\nMIX',
			command: 'nextmix',
			feedbacks: [mixEditorStateFeedback('canGoNextMix', COLOR_WHITE, COLOR_BLUE)],
		},
		{
			id: 'mix_previous_profile',
			name: 'Previous profile',
			text: 'PREV\\nPROFILE',
			command: 'previousprofile',
			feedbacks: [connectionOkFeedback(COLOR_WHITE, COLOR_BLUE)],
			size: '14',
		},
		{
			id: 'mix_next_profile',
			name: 'Next profile',
			text: 'NEXT\\nPROFILE',
			command: 'nextprofile',
			feedbacks: [connectionOkFeedback(COLOR_WHITE, COLOR_BLUE)],
			size: '14',
		},
		{
			id: 'mix_select_profile',
			name: 'Select profile',
			text: 'SELECT\\nPROFILE',
			command: 'selectprofile',
			feedbacks: [connectionOkFeedback(COLOR_WHITE, COLOR_BLUE)],
			size: '14',
		},
	]

	for (const definition of presetDefinitions) {
		presets[definition.id] = mixCommandPreset(
			definition.name,
			definition.text,
			definition.command,
			definition.feedbacks,
			definition.size,
			definition.bgcolor,
		)
	}

	return presetDefinitions.map((definition) => definition.id)
}

function mixCommandPreset(
	name: string,
	text: string,
	command: MixEditorCommand,
	feedbacks: PresetFeedback[],
	size: CompanionTextSize = 'auto',
	bgcolor: number = COLOR_GRAY,
): CompanionPresetDefinitions<ModuleSchema>[typeof name] {
	return {
		type: 'simple',
		name,
		style: {
			text,
			size,
			color: COLOR_WHITE,
			bgcolor,
		},
		steps: [
			{
				down: [{ actionId: 'mix_editor_command', options: { command } }],
				up: [],
			},
		],
		feedbacks,
	}
}

function mixEditorStateFeedback(state: MixEditorState, color: number, bgcolor: number): PresetFeedback {
	return {
		feedbackId: 'mix_editor_state',
		options: { state },
		style: { color, bgcolor },
	}
}

function addRecorderPresets(presets: CompanionPresetDefinitions<ModuleSchema>): string[] {
	const presetDefinitions: Array<{
		id: string
		name: string
		text: string
		command: RecorderCommand
		feedbacks: PresetFeedback[]
		size?: CompanionTextSize
	}> = [
		{
			id: 'recorder_play',
			name: 'Recorder play',
			text: 'REC\\nPLAY',
			command: 'play',
			feedbacks: [
				recorderStateFeedback('canPlay', COLOR_WHITE, COLOR_BLUE),
				recorderStateFeedback('playing', COLOR_WHITE, COLOR_GREEN),
			],
		},
		{
			id: 'recorder_stop',
			name: 'Recorder stop',
			text: 'REC\\nSTOP',
			command: 'stop',
			feedbacks: [
				recorderStateFeedback('playing', COLOR_WHITE, COLOR_RED),
				recorderStateFeedback('recording', COLOR_WHITE, COLOR_RED),
				recorderStateFeedback('canStop', COLOR_WHITE, COLOR_RED),
			],
		},
		{
			id: 'recorder_record',
			name: 'Recorder toggle recording',
			text: 'REC\\nTOGGLE',
			command: 'record',
			feedbacks: [
				recorderStateFeedback('canStartRecord', COLOR_WHITE, COLOR_BLUE),
				recorderStateFeedback('recording', COLOR_WHITE, COLOR_RED),
			],
			size: '14',
		},
		{
			id: 'recorder_record_start',
			name: 'Recorder start recording',
			text: 'REC\\nSTART',
			command: 'record_start',
			feedbacks: [
				recorderStateFeedback('canStartRecord', COLOR_WHITE, COLOR_BLUE),
				recorderStateFeedback('recording', COLOR_WHITE, COLOR_RED),
			],
			size: '14',
		},
		{
			id: 'recorder_record_stop',
			name: 'Recorder stop recording',
			text: 'STOP\\nREC',
			command: 'record_stop',
			feedbacks: [recorderStateFeedback('recording', COLOR_WHITE, COLOR_RED)],
			size: '14',
		},
		{
			id: 'recorder_previous_profile',
			name: 'Recorder previous profile',
			text: 'PREV\\nPROFILE',
			command: 'previous_profile',
			feedbacks: [recorderStateFeedback('canChangeProcessingProfile', COLOR_WHITE, COLOR_BLUE)],
			size: '14',
		},
		{
			id: 'recorder_next_profile',
			name: 'Recorder next profile',
			text: 'NEXT\\nPROFILE',
			command: 'next_profile',
			feedbacks: [recorderStateFeedback('canChangeProcessingProfile', COLOR_WHITE, COLOR_BLUE)],
			size: '14',
		},
		{
			id: 'recorder_select_profile',
			name: 'Recorder select profile',
			text: 'SELECT\\nPROFILE',
			command: 'select_profile',
			feedbacks: [recorderStateFeedback('canChangeProcessingProfile', COLOR_WHITE, COLOR_BLUE)],
			size: '14',
		},
	]

	for (const definition of presetDefinitions) {
		presets[definition.id] = recorderCommandPreset(
			definition.name,
			definition.text,
			definition.command,
			definition.feedbacks,
			definition.size,
		)
	}

	return presetDefinitions.map((definition) => definition.id)
}

function recorderCommandPreset(
	name: string,
	text: string,
	command: RecorderCommand,
	feedbacks: PresetFeedback[],
	size: CompanionTextSize = 'auto',
): CompanionPresetDefinitions<ModuleSchema>[typeof name] {
	return {
		type: 'simple',
		name,
		style: {
			text,
			size,
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'recorder_command', options: { command } }],
				up: [],
			},
		],
		feedbacks,
	}
}

function recorderStateFeedback(state: RecorderState, color: number, bgcolor: number): PresetFeedback {
	return {
		feedbackId: 'recorder_state',
		options: { state },
		style: { color, bgcolor },
	}
}
