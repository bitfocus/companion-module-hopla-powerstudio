import { PLAYLIST_WINDOW_ITEM_COUNT } from './constants.js'
import type { PlayoutModel, PlayoutProgramLogLineModel } from './types.js'

export type PlaylistItem = {
	item: number
	playlistIndex: number
	line?: PlayoutProgramLogLineModel
	isPlaying: boolean
	isNextItem: boolean
}

export type PlaylistItemState = 'hasItem' | 'isPlaying' | 'isNextItem'

export function getPlaylistWindowItems(
	currentPlaylist: PlayoutProgramLogLineModel[] | undefined,
	playout: PlayoutModel | undefined,
	offset: number,
): PlaylistItem[] {
	return Array.from({ length: PLAYLIST_WINDOW_ITEM_COUNT }, (_, index) => {
		const playlistIndex = offset + index
		const line = currentPlaylist?.[playlistIndex]
		const player = line ? playout?.players?.find((entry) => entry.id === line.id) : undefined

		return {
			item: index + 1,
			playlistIndex,
			line,
			isPlaying: player?.playing === true,
			isNextItem: player?.isNextItem === true,
		}
	})
}

export function clampPlaylistWindowOffset(
	currentPlaylist: PlayoutProgramLogLineModel[] | undefined,
	offset: number,
): number {
	const playlistLength = currentPlaylist?.length ?? 0
	const maxOffset = Math.max(0, playlistLength - PLAYLIST_WINDOW_ITEM_COUNT)

	return Math.min(Math.max(0, offset), maxOffset)
}

export function playlistItemVariable(item: number, field: string): string {
	return `playlist_item_${item}_${field}`
}
