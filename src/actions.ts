import type ModuleInstance from './main.js'
import { PLAYLIST_WINDOW_ITEM_COUNT, RACK_ITEM_COUNT } from './constants.js'
import { rackItemIndexFromDisplayNumber } from './cart-rack.js'
import {
	CART_PLAYER_CHOICES,
	MIX_EDITOR_COMMAND_CHOICES,
	PLAYER_CHOICES,
	PLAYER_COMMAND_CHOICES,
	PLAYOUT_MODE_CHOICES,
	RECORDER_COMMAND_CHOICES,
} from './options.js'
import type { MixEditorCommand, PlayerCommand, PlayoutMode, RecorderCommand } from './types.js'

export type ActionsSchema = {
	refresh_status: {
		options: Record<string, never>
	}
	player_command: {
		options: {
			player: number
			command: PlayerCommand
		}
	}
	player_cue_or_stop: {
		options: {
			player: number
		}
	}
	set_playout_mode: {
		options: {
			mode: PlayoutMode
		}
	}
	load_next_playlist: {
		options: Record<string, never>
	}
	refresh_playout: {
		options: Record<string, never>
	}
	set_next_item: {
		options: {
			nextLineId: string
		}
	}
	set_next_playlist_window_item: {
		options: {
			item: number
		}
	}
	playlist_window_previous: {
		options: Record<string, never>
	}
	playlist_window_next: {
		options: Record<string, never>
	}
	playlist_window_reset: {
		options: Record<string, never>
	}
	playlist_window_set_offset: {
		options: {
			offset: number
		}
	}
	trigger_cart: {
		options: {
			cartPlayerIndex: number
			rackSlot: number
		}
	}
	stop_cart: {
		options: {
			cartPlayerIndex: number
		}
	}
	mix_editor_command: {
		options: {
			command: MixEditorCommand
		}
	}
	recorder_command: {
		options: {
			command: RecorderCommand
		}
	}
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		refresh_status: {
			name: 'Refresh cached status',
			options: [],
			callback: async () => {
				await self.refreshStatus({ forceAfterCurrent: true, interruptCurrent: true })
			},
		},
		player_command: {
			name: 'Playout: send player command',
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
					id: 'command',
					label: 'Command',
					default: 'Play',
					choices: PLAYER_COMMAND_CHOICES,
				},
			],
			callback: async (event) => {
				const command = await resolvePlayerCommand(self, event.options.player, event.options.command)

				await self.runCommand('send player command', 'playoutCommands', async (client) => {
					await client.setPlayerCommand(event.options.player, command)
				})
			},
		},
		player_cue_or_stop: {
			name: 'Playout: cue or stop player',
			options: [
				{
					type: 'dropdown',
					id: 'player',
					label: 'Player',
					default: 0,
					choices: PLAYER_CHOICES,
				},
			],
			callback: async (event) => {
				const command = await resolveCueOrStopCommand(self, event.options.player)

				await self.runCommand('cue or stop player', 'playoutCommands', async (client) => {
					await client.setPlayerCommand(event.options.player, command)
				})
			},
		},
		set_playout_mode: {
			name: 'Playout: set mode',
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Mode',
					default: 'LiveAssist',
					choices: PLAYOUT_MODE_CHOICES,
				},
			],
			callback: async (event) => {
				await self.runCommand('set playout mode', 'playoutMode', async (client) => {
					await client.setPlayoutMode(event.options.mode)
				})
			},
		},
		load_next_playlist: {
			name: 'Playout: load next playlist',
			options: [],
			callback: async () => {
				await self.runCommand('load next playlist', 'playoutCommands', async (client) => {
					await client.loadNextPlaylist()
				})
			},
		},
		refresh_playout: {
			name: 'Playout: refresh playlist',
			options: [],
			callback: async () => {
				await self.runCommand('refresh playout', 'playoutCommands', async (client) => {
					await client.refreshPlayout()
				})
			},
		},
		set_next_item: {
			name: 'Playout: set next item',
			options: [
				{
					type: 'textinput',
					id: 'nextLineId',
					label: 'Program line id',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const nextLineIdText = event.options.nextLineId

				if (nextLineIdText.trim() !== nextLineIdText || !/^\d+$/.test(nextLineIdText)) {
					throw new Error(`Program line id must be a safe integer: ${event.options.nextLineId}`)
				}

				const nextLineId = Number(nextLineIdText)

				if (!Number.isSafeInteger(nextLineId) || nextLineId <= 0) {
					throw new Error(`Program line id must be a positive safe integer: ${event.options.nextLineId}`)
				}

				await self.runCommand('set next item', 'playoutCommands', async (client) => {
					await client.setNextItem(nextLineId)
				})
			},
		},
		set_next_playlist_window_item: {
			name: 'Playlist: set next visible item',
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
			callback: async (event) => {
				await self.setNextPlaylistWindowItem(event.options.item)
			},
		},
		playlist_window_previous: {
			name: 'Playlist: previous window',
			options: [],
			callback: async () => {
				self.shiftPlaylistWindow(-PLAYLIST_WINDOW_ITEM_COUNT)
			},
		},
		playlist_window_next: {
			name: 'Playlist: next window',
			options: [],
			callback: async () => {
				self.shiftPlaylistWindow(PLAYLIST_WINDOW_ITEM_COUNT)
			},
		},
		playlist_window_reset: {
			name: 'Playlist: reset window',
			options: [],
			callback: async () => {
				self.setPlaylistWindowOffset(0)
			},
		},
		playlist_window_set_offset: {
			name: 'Playlist: set window offset',
			options: [
				{
					type: 'number',
					id: 'offset',
					label: 'Zero-based playlist offset',
					default: 0,
					min: 0,
					max: 999,
					step: 1,
				},
			],
			callback: async (event) => {
				self.setPlaylistWindowOffset(event.options.offset)
			},
		},
		trigger_cart: {
			name: 'Carts: trigger rack slot',
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
			callback: async (event) => {
				const rackItemIndex = rackItemIndexFromDisplayNumber(event.options.rackSlot)

				await self.runCommand('trigger cart', 'carts', async (client) => {
					await client.triggerCart(event.options.cartPlayerIndex, rackItemIndex)
				})
			},
		},
		stop_cart: {
			name: 'Carts: stop cart player',
			options: [
				{
					type: 'dropdown',
					id: 'cartPlayerIndex',
					label: 'Cart player',
					default: 0,
					choices: CART_PLAYER_CHOICES,
				},
			],
			callback: async (event) => {
				await self.runCommand('stop cart', 'carts', async (client) => {
					await client.stopCart(event.options.cartPlayerIndex)
				})
			},
		},
		mix_editor_command: {
			name: 'Mix editor: command',
			options: [
				{
					type: 'dropdown',
					id: 'command',
					label: 'Command',
					default: 'play',
					choices: MIX_EDITOR_COMMAND_CHOICES,
				},
			],
			callback: async (event) => {
				await self.runCommand('run mix editor command', 'mixEditor', async (client) => {
					await client.runMixEditorCommand(event.options.command)
				})
			},
		},
		recorder_command: {
			name: 'Recorder: command',
			options: [
				{
					type: 'dropdown',
					id: 'command',
					label: 'Command',
					default: 'play',
					choices: RECORDER_COMMAND_CHOICES,
				},
			],
			callback: async (event) => {
				await self.runCommand('run recorder command', 'recorder', async (client) => {
					await client.runRecorderCommand(event.options.command)
				})
			},
		},
	})
}

async function resolvePlayerCommand(
	self: ModuleInstance,
	player: number,
	requestedCommand: PlayerCommand,
): Promise<PlayerCommand> {
	if (requestedCommand !== 'Cue') {
		return requestedCommand
	}

	return resolveCueOrStopCommand(self, player)
}

async function resolveCueOrStopCommand(self: ModuleInstance, player: number): Promise<PlayerCommand> {
	await self.refreshStatus({ forceAfterCurrent: true, interruptCurrent: true })

	return self.state.playout?.players?.[player]?.playing === true ? 'Stop' : 'Cue'
}
