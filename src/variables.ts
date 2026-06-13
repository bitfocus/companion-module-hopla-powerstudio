import type ModuleInstance from './main.js'
import {
	cartRackSlotStatusVariable,
	cartRackSlotTitleVariable,
	getCartRackItems,
	rackItemDisplayNumber,
} from './cart-rack.js'
import { CART_PLAYER_COUNT, PLAYER_COUNT, PLAYLIST_WINDOW_ITEM_COUNT } from './constants.js'
import { cartPlayerDisplayName, cartPlayerVariable, playerDisplayName, playerVariable } from './labels.js'
import { playlistItemVariable } from './playlist-window.js'
import {
	isAnyCartPlaying,
	isAnyPlayerPlaying,
	selectFirstPlayingCart,
	selectFirstPlayingPlayer,
	selectNextPlayer,
} from './state-selectors.js'

export type VariablesSchema = Record<string, string | number | boolean>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const definitions: Record<string, { name: string }> = {
		connection_status: { name: 'Connection status' },
		connection_ok: { name: 'Connection is OK' },
		last_status_error: { name: 'Last status refresh error' },
		last_command_error: { name: 'Last command error' },
		version: { name: 'Power Studio version' },
		build: { name: 'Power Studio build' },
		last_detected_power_studio_version: { name: 'Last detected Power Studio version' },
		last_detected_power_studio_build: { name: 'Last detected Power Studio build' },
		parsed_power_studio_version: { name: 'Parsed Power Studio version' },
		power_studio_minimum_supported_version: { name: 'Minimum supported Power Studio version' },
		power_studio_version_supported: { name: 'Power Studio version is supported' },
		enabled_capabilities: { name: 'Enabled capabilities' },
		uptime: { name: 'Application uptime' },
		last_updated: { name: 'Last status update' },
		playout_mode: { name: 'Playout mode' },
		on_air_state: { name: 'On-air state' },
		any_player_playing: { name: 'Any player playing' },
		active_player: { name: 'First playing player' },
		current_track_id: { name: 'Current track id' },
		current_track_artist: { name: 'Current track artist' },
		current_track_title: { name: 'Current track title' },
		next_player: { name: 'Next player' },
		next_track_id: { name: 'Next track id' },
		next_track_artist: { name: 'Next track artist' },
		next_track_title: { name: 'Next track title' },
		next_playlist_time_mode: { name: 'Next playlist time mode' },
		next_start_time: { name: 'Next start time' },
		any_cart_playing: { name: 'Any cart playing' },
		active_cart: { name: 'First playing cart' },
		playlist_window_offset: { name: 'Playlist window offset' },
		playlist_window_first_item: { name: 'Playlist window first item number' },
		mix_editor_playing: { name: 'Mix editor playing' },
		mix_editor_recording: { name: 'Mix editor recording' },
		mix_editor_can_play: { name: 'Mix editor can play' },
		mix_editor_can_stop: { name: 'Mix editor can stop' },
		mix_editor_can_save: { name: 'Mix editor can save' },
		mix_editor_can_undo: { name: 'Mix editor can undo' },
		mix_editor_can_go_previous_mix: { name: 'Mix editor can go previous mix' },
		mix_editor_can_go_next_mix: { name: 'Mix editor can go next mix' },
		mix_editor_can_record_mix: { name: 'Mix editor can record mix' },
		mix_editor_can_play_next: { name: 'Mix editor can play next' },
		recorder_file_name: { name: 'Recorder file name' },
		recorder_playing: { name: 'Recorder playing' },
		recorder_recording: { name: 'Recorder recording' },
		recorder_stopped: { name: 'Recorder stopped' },
		recorder_position: { name: 'Recorder position in seconds' },
		recorder_duration: { name: 'Recorder duration in seconds' },
		recorder_can_play: { name: 'Recorder can play' },
		recorder_can_stop: { name: 'Recorder can stop' },
		recorder_can_start_record: { name: 'Recorder can start recording' },
		recorder_can_change_processing_profile: { name: 'Recorder can change processing profile' },
	}

	for (let index = 0; index < PLAYER_COUNT; index++) {
		const label = playerDisplayName(index)

		definitions[playerVariable(index, 'title')] = { name: `${label} title` }
		definitions[playerVariable(index, 'artist')] = { name: `${label} artist` }
		definitions[playerVariable(index, 'playing')] = { name: `${label} playing` }
		definitions[playerVariable(index, 'cued')] = { name: `${label} cued` }
		definitions[playerVariable(index, 'pfl')] = { name: `${label} PFL` }
		definitions[playerVariable(index, 'position')] = { name: `${label} position in seconds` }
		definitions[playerVariable(index, 'duration')] = { name: `${label} duration in seconds` }
	}

	for (let index = 0; index < CART_PLAYER_COUNT; index++) {
		const label = cartPlayerDisplayName(index)

		definitions[cartPlayerVariable(index, 'playing')] = { name: `${label} playing` }
		definitions[cartPlayerVariable(index, 'position')] = { name: `${label} position in seconds` }
		definitions[cartPlayerVariable(index, 'duration')] = { name: `${label} duration in seconds` }
		definitions[cartPlayerVariable(index, 'play_mode')] = { name: `${label} play mode` }
	}

	for (let item = 1; item <= PLAYLIST_WINDOW_ITEM_COUNT; item++) {
		definitions[playlistItemVariable(item, 'has_item')] = { name: `Playlist item ${item} has item` }
		definitions[playlistItemVariable(item, 'line_id')] = { name: `Playlist item ${item} line id` }
		definitions[playlistItemVariable(item, 'artist')] = { name: `Playlist item ${item} artist` }
		definitions[playlistItemVariable(item, 'title')] = { name: `Playlist item ${item} title` }
		definitions[playlistItemVariable(item, 'content_type')] = { name: `Playlist item ${item} content type` }
		definitions[playlistItemVariable(item, 'duration')] = { name: `Playlist item ${item} duration` }
		definitions[playlistItemVariable(item, 'start_time')] = { name: `Playlist item ${item} start time` }
		definitions[playlistItemVariable(item, 'is_playing')] = { name: `Playlist item ${item} is playing` }
		definitions[playlistItemVariable(item, 'is_next_item')] = { name: `Playlist item ${item} is next item` }
	}

	for (const item of getCartRackItems(self.state.carts)) {
		const label = cartPlayerDisplayName(item.cartPlayerIndex)
		const rackSlot = rackItemDisplayNumber(item.rackItemIndex)

		definitions[cartRackSlotTitleVariable(item.cartPlayerIndex, item.rackItemIndex)] = {
			name: `${label} slot ${rackSlot} title`,
		}
		definitions[cartRackSlotStatusVariable(item.cartPlayerIndex, item.rackItemIndex)] = {
			name: `${label} slot ${rackSlot} status`,
		}
	}

	self.setVariableDefinitions(definitions)
}

export function UpdateVariableValues(self: ModuleInstance, connectionStatus: string): void {
	const activePlayer = selectFirstPlayingPlayer(self.state.playout)
	const nextPlayer = selectNextPlayer(self.state.playout)
	const activeCart = selectFirstPlayingCart(self.state.carts)
	const currentVersion = self.isConnectionOk() ? self.state.version : undefined
	const lastDetectedVersion = self.state.lastDetectedVersion ?? self.state.version
	const values: VariablesSchema = {
		connection_status: connectionStatus,
		connection_ok: self.isConnectionOk(),
		last_status_error: self.state.lastStatusError ?? '',
		last_command_error: self.state.lastCommandError ?? '',
		version: currentVersion?.version ?? '',
		build: currentVersion?.build ?? '',
		last_detected_power_studio_version: lastDetectedVersion?.version ?? '',
		last_detected_power_studio_build: lastDetectedVersion?.build ?? '',
		parsed_power_studio_version: self.state.capabilities?.apiVersionText ?? 'unknown',
		power_studio_minimum_supported_version: self.state.capabilities?.minimumSupportedVersion ?? '',
		power_studio_version_supported: self.state.capabilities?.supportedApiVersion ?? true,
		enabled_capabilities: self.state.capabilities?.supportedLabels.join(', ') ?? '',
		uptime: self.state.uptime?.uptime ?? '',
		last_updated: self.state.lastUpdated ?? '',
		playout_mode: self.state.playout?.playoutMode ?? '',
		on_air_state: self.state.playout?.onAirState ?? '',
		any_player_playing: isAnyPlayerPlaying(self.state.playout),
		active_player: activePlayer?.name ?? '',
		current_track_id: activePlayer?.player.trackId ?? '',
		current_track_artist: activePlayer?.player.artist ?? '',
		current_track_title: activePlayer?.player.title ?? '',
		next_player: nextPlayer?.name ?? '',
		next_track_id: nextPlayer?.player.trackId ?? '',
		next_track_artist: nextPlayer?.player.artist ?? '',
		next_track_title: nextPlayer?.player.title ?? '',
		next_playlist_time_mode: self.state.playout?.nextPlaylistTimeMode ?? '',
		next_start_time: self.state.playout?.nextStartTime ?? '',
		any_cart_playing: isAnyCartPlaying(self.state.carts),
		active_cart: activeCart?.name ?? '',
		playlist_window_offset: self.getPlaylistWindowOffset(),
		playlist_window_first_item: self.getPlaylistWindowOffset() + 1,
		mix_editor_playing: self.state.mixEditor?.playing ?? false,
		mix_editor_recording: self.state.mixEditor?.recording ?? false,
		mix_editor_can_play: self.state.mixEditor?.canPlay ?? false,
		mix_editor_can_stop: self.state.mixEditor?.canStop ?? false,
		mix_editor_can_save: self.state.mixEditor?.canSave ?? false,
		mix_editor_can_undo: self.state.mixEditor?.canUndo ?? false,
		mix_editor_can_go_previous_mix: self.state.mixEditor?.canGoPreviousMix ?? false,
		mix_editor_can_go_next_mix: self.state.mixEditor?.canGoNextMix ?? false,
		mix_editor_can_record_mix: self.state.mixEditor?.canRecordMix ?? false,
		mix_editor_can_play_next: self.state.mixEditor?.canPlayNext ?? false,
		recorder_file_name: self.state.recorder?.fileName ?? '',
		recorder_playing: self.state.recorder?.playing ?? false,
		recorder_recording: self.state.recorder?.recording ?? false,
		recorder_stopped: self.state.recorder?.stopped ?? false,
		recorder_position: self.state.recorder?.position ?? 0,
		recorder_duration: self.state.recorder?.duration ?? 0,
		recorder_can_play: self.state.recorder?.canPlay ?? false,
		recorder_can_stop: self.state.recorder?.canStop ?? false,
		recorder_can_start_record: self.state.recorder?.canStartRecord ?? false,
		recorder_can_change_processing_profile: self.state.recorder?.canChangeProcessingProfile ?? false,
	}

	for (let index = 0; index < PLAYER_COUNT; index++) {
		const player = self.state.playout?.players?.[index]

		values[playerVariable(index, 'title')] = player?.title ?? ''
		values[playerVariable(index, 'artist')] = player?.artist ?? ''
		values[playerVariable(index, 'playing')] = player?.playing ?? false
		values[playerVariable(index, 'cued')] = player?.cued ?? false
		values[playerVariable(index, 'pfl')] = player?.pfl ?? false
		values[playerVariable(index, 'position')] = player?.position ?? 0
		values[playerVariable(index, 'duration')] = player?.duration ?? 0
	}

	for (let index = 0; index < CART_PLAYER_COUNT; index++) {
		const cart = self.state.carts?.carts?.[index]

		values[cartPlayerVariable(index, 'playing')] = cart?.playing ?? false
		values[cartPlayerVariable(index, 'position')] = cart?.position ?? 0
		values[cartPlayerVariable(index, 'duration')] = cart?.duration ?? 0
		values[cartPlayerVariable(index, 'play_mode')] = cart?.playMode ?? ''
	}

	for (const item of self.getPlaylistWindowItems()) {
		values[playlistItemVariable(item.item, 'has_item')] = item.line !== undefined
		values[playlistItemVariable(item.item, 'line_id')] = item.line?.id ?? ''
		values[playlistItemVariable(item.item, 'artist')] = item.line?.artist ?? ''
		values[playlistItemVariable(item.item, 'title')] = item.line?.title ?? ''
		values[playlistItemVariable(item.item, 'content_type')] = item.line?.contentType ?? ''
		values[playlistItemVariable(item.item, 'duration')] = item.line?.duration ?? 0
		values[playlistItemVariable(item.item, 'start_time')] = item.line?.startTime ?? ''
		values[playlistItemVariable(item.item, 'is_playing')] = item.isPlaying
		values[playlistItemVariable(item.item, 'is_next_item')] = item.isNextItem
	}

	for (const item of getCartRackItems(self.state.carts)) {
		values[cartRackSlotTitleVariable(item.cartPlayerIndex, item.rackItemIndex)] =
			item.title || `${cartPlayerDisplayName(item.cartPlayerIndex)}:${rackItemDisplayNumber(item.rackItemIndex)}`
		values[cartRackSlotStatusVariable(item.cartPlayerIndex, item.rackItemIndex)] = item.status
	}

	self.setVariableValues(values)
}
