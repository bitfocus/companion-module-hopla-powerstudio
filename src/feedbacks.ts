import type ModuleInstance from './main.js'
import { PLAYLIST_WINDOW_ITEM_COUNT, RACK_ITEM_COUNT } from './constants.js'
import { cartRackSlotTitleVariable, rackItemIndexFromDisplayNumber } from './cart-rack.js'
import { optionalModuleVariableLines } from './companion-variable.js'
import { cartPlayerLabel, playerLabel, playerVariable } from './labels.js'
import {
	CART_PLAYER_CHOICES,
	CART_ITEM_STATUS_CHOICES,
	CONTENT_TYPE_CHOICES,
	MIX_EDITOR_STATE_CHOICES,
	PLAYER_CHOICES,
	PLAYER_STATE_CHOICES,
	PLAYOUT_MODE_CHOICES,
	RECORDER_STATE_CHOICES,
} from './options.js'
import type { PlaylistItemState } from './playlist-window.js'
import { playlistItemVariable } from './playlist-window.js'
import { hasPlayerItem, isAnyCartPlaying, isAnyPlayerPlaying } from './state-selectors.js'
import type {
	CartPlayerItemStatus,
	ContentTypeType,
	MixEditorState,
	OnAirState,
	PlayerState,
	PlayoutMode,
	RecorderState,
} from './types.js'

type PlayerTransportPreset = 'play' | 'cue' | 'pfl_toggle'

const PLAYER_TRANSPORT_PRESET_CHOICES = [
	{ id: 'play', label: 'Play' },
	{ id: 'cue', label: 'Cue' },
	{ id: 'pfl_toggle', label: 'PFL' },
] satisfies Array<{ id: PlayerTransportPreset; label: string }>

const PLAYER_TRANSPORT_PRESET_LABELS: Record<PlayerTransportPreset, string> = {
	play: 'PLAY',
	cue: 'CUE',
	pfl_toggle: 'PFL',
}

export type FeedbacksSchema = {
	connection_ok: {
		type: 'boolean'
		options: Record<string, never>
	}
	connection_lost: {
		type: 'boolean'
		options: Record<string, never>
	}
	any_player_playing: {
		type: 'boolean'
		options: Record<string, never>
	}
	any_cart_playing: {
		type: 'boolean'
		options: Record<string, never>
	}
	playout_mode: {
		type: 'boolean'
		options: {
			mode: PlayoutMode
		}
	}
	on_air_state: {
		type: 'boolean'
		options: {
			state: OnAirState
		}
	}
	player_state: {
		type: 'boolean'
		options: {
			player: number
			state: PlayerState
		}
	}
	player_loaded: {
		type: 'boolean'
		options: {
			player: number
		}
	}
	player_empty: {
		type: 'boolean'
		options: {
			player: number
		}
	}
	cart_player_playing: {
		type: 'boolean'
		options: {
			cartPlayerIndex: number
		}
	}
	cart_slot_status: {
		type: 'boolean'
		options: {
			cartPlayerIndex: number
			rackSlot: number
			status: CartPlayerItemStatus
		}
	}
	playlist_item_state: {
		type: 'boolean'
		options: {
			item: number
			state: PlaylistItemState
		}
	}
	playlist_item_content_type: {
		type: 'boolean'
		options: {
			item: number
			contentType: ContentTypeType
		}
	}
	mix_editor_state: {
		type: 'boolean'
		options: {
			state: MixEditorState
		}
	}
	recorder_state: {
		type: 'boolean'
		options: {
			state: RecorderState
		}
	}
	cart_rack_preset_text: {
		type: 'advanced'
		options: {
			cartPlayerIndex: number
			rackSlot: number
		}
	}
	player_transport_preset_text: {
		type: 'advanced'
		options: {
			player: number
			transport: PlayerTransportPreset
		}
	}
	playlist_window_item_preset_text: {
		type: 'advanced'
		options: {
			item: number
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		connection_ok: {
			name: 'Power Studio connection is OK',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [],
			callback: () => self.isConnectionOk(),
		},
		connection_lost: {
			name: 'Power Studio connection is not OK',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x303030,
				color: 0xffffff,
			},
			options: [],
			callback: () => !self.isConnectionOk(),
		},
		any_player_playing: {
			name: 'Any player is playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [],
			callback: () => isAnyPlayerPlaying(self.state.playout),
		},
		any_cart_playing: {
			name: 'Any cart is playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0xaa0000,
				color: 0xffffff,
			},
			options: [],
			callback: () => isAnyCartPlaying(self.state.carts),
		},
		playout_mode: {
			name: 'Playout mode is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Mode',
					default: 'LiveAssist',
					choices: PLAYOUT_MODE_CHOICES,
				},
			],
			callback: (feedback) => self.state.playout?.playoutMode === feedback.options.mode,
		},
		on_air_state: {
			name: 'On-air state is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0xff0000,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'OnAir',
					choices: [
						{ id: 'OffAir', label: 'Off air' },
						{ id: 'OnAir', label: 'On air' },
					],
				},
			],
			callback: (feedback) => self.state.playout?.onAirState === feedback.options.state,
		},
		player_state: {
			name: 'Player state is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'player',
					label: 'Player',
					default: 0,
					choices: PLAYER_CHOICES,
				},
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'playing',
					choices: PLAYER_STATE_CHOICES,
				},
			],
			callback: (feedback) => {
				const player = self.state.playout?.players?.[feedback.options.player]

				return player?.[feedback.options.state] === true
			},
		},
		player_loaded: {
			name: 'Player has item loaded',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x0044cc,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'player',
					label: 'Player',
					default: 0,
					choices: PLAYER_CHOICES,
				},
			],
			callback: (feedback) => hasPlayerItem(self.state.playout?.players?.[feedback.options.player]),
		},
		player_empty: {
			name: 'Player is empty',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x303030,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'player',
					label: 'Player',
					default: 0,
					choices: PLAYER_CHOICES,
				},
			],
			callback: (feedback) => {
				const player = self.state.playout?.players?.[feedback.options.player]

				return player !== undefined && !hasPlayerItem(player)
			},
		},
		cart_player_playing: {
			name: 'Cart is playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'cartPlayerIndex',
					label: 'Cart player',
					default: 0,
					choices: CART_PLAYER_CHOICES,
				},
			],
			callback: (feedback) => self.state.carts?.carts?.[feedback.options.cartPlayerIndex]?.playing === true,
		},
		cart_slot_status: {
			name: 'Cart rack slot has status',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'cartPlayerIndex',
					label: 'Cart player',
					default: 0,
					choices: CART_PLAYER_CHOICES,
				},
				{
					type: 'number',
					id: 'rackSlot',
					label: 'Rack slot',
					default: 1,
					min: 1,
					max: RACK_ITEM_COUNT,
					step: 1,
				},
				{
					type: 'dropdown',
					id: 'status',
					label: 'Status',
					default: 'Playing',
					choices: CART_ITEM_STATUS_CHOICES,
				},
			],
			callback: (feedback) => {
				const cart = self.state.carts?.carts?.[feedback.options.cartPlayerIndex]
				const rackItemIndex = rackItemIndexFromDisplayNumber(feedback.options.rackSlot)
				const rackItem = cart?.rack?.[rackItemIndex]

				return (rackItem?.status ?? 'None') === feedback.options.status
			},
		},
		playlist_item_state: {
			name: 'Playlist window item state is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'number',
					id: 'item',
					label: 'Visible item',
					default: 1,
					min: 1,
					max: PLAYLIST_WINDOW_ITEM_COUNT,
					step: 1,
				},
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'hasItem',
					choices: [
						{ id: 'hasItem', label: 'Has item' },
						{ id: 'isPlaying', label: 'Is playing' },
						{ id: 'isNextItem', label: 'Is next item' },
					],
				},
			],
			callback: (feedback) => {
				const item = self.getPlaylistWindowItems().find((entry) => entry.item === feedback.options.item)

				if (feedback.options.state === 'hasItem') {
					return item?.line !== undefined
				}

				return item?.[feedback.options.state] === true
			},
		},
		playlist_item_content_type: {
			name: 'Playlist window item has content type',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'number',
					id: 'item',
					label: 'Visible item',
					default: 1,
					min: 1,
					max: PLAYLIST_WINDOW_ITEM_COUNT,
					step: 1,
				},
				{
					type: 'dropdown',
					id: 'contentType',
					label: 'Content type',
					default: 'Track',
					choices: CONTENT_TYPE_CHOICES,
				},
			],
			callback: (feedback) => {
				const item = self.getPlaylistWindowItems().find((entry) => entry.item === feedback.options.item)

				return item?.line?.contentType === feedback.options.contentType
			},
		},
		mix_editor_state: {
			name: 'Mix editor state is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'playing',
					choices: MIX_EDITOR_STATE_CHOICES,
				},
			],
			callback: (feedback) => self.state.mixEditor?.[feedback.options.state] === true,
		},
		recorder_state: {
			name: 'Recorder state is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'playing',
					choices: RECORDER_STATE_CHOICES,
				},
			],
			callback: (feedback) => self.state.recorder?.[feedback.options.state] === true,
		},
		cart_rack_preset_text: {
			name: 'Cart rack preset text follows title setting',
			type: 'advanced',
			options: [
				{
					type: 'dropdown',
					id: 'cartPlayerIndex',
					label: 'Cart player',
					default: 0,
					choices: CART_PLAYER_CHOICES,
				},
				{
					type: 'number',
					id: 'rackSlot',
					label: 'Rack slot',
					default: 1,
					min: 1,
					max: RACK_ITEM_COUNT,
					step: 1,
				},
			],
			callback: (feedback) => {
				const rackItemIndex = rackItemIndexFromDisplayNumber(feedback.options.rackSlot)
				const titleVariable = cartRackSlotTitleVariable(feedback.options.cartPlayerIndex, rackItemIndex)
				const baseText = `CART ${cartPlayerLabel(feedback.options.cartPlayerIndex)}:${feedback.options.rackSlot}`

				return {
					text: optionalModuleVariableLines(self, baseText, self.config.showCartRackPresetTitles !== false, [
						titleVariable,
					]),
				}
			},
		},
		player_transport_preset_text: {
			name: 'Player transport preset text follows title setting',
			type: 'advanced',
			options: [
				{
					type: 'dropdown',
					id: 'player',
					label: 'Player',
					default: 0,
					choices: PLAYER_CHOICES,
				},
				{
					type: 'dropdown',
					id: 'transport',
					label: 'Transport',
					default: 'play',
					choices: PLAYER_TRANSPORT_PRESET_CHOICES,
				},
			],
			callback: (feedback) => {
				const baseText = `${PLAYER_TRANSPORT_PRESET_LABELS[feedback.options.transport]} ${playerLabel(feedback.options.player)}`

				return {
					text: optionalModuleVariableLines(self, baseText, self.config.showPlayerTransportPresetTitles !== false, [
						playerVariable(feedback.options.player, 'artist'),
						playerVariable(feedback.options.player, 'title'),
					]),
				}
			},
		},
		playlist_window_item_preset_text: {
			name: 'Playlist window preset text follows title setting',
			type: 'advanced',
			options: [
				{
					type: 'number',
					id: 'item',
					label: 'Visible item',
					default: 1,
					min: 1,
					max: PLAYLIST_WINDOW_ITEM_COUNT,
					step: 1,
				},
			],
			callback: (feedback) => {
				const artistVariable = playlistItemVariable(feedback.options.item, 'artist')
				const titleVariable = playlistItemVariable(feedback.options.item, 'title')

				return {
					text: optionalModuleVariableLines(
						self,
						`NEXT ${feedback.options.item}`,
						self.config.showPlaylistWindowPresetTitles !== false,
						[artistVariable, titleVariable],
					),
				}
			},
		},
	})
}
