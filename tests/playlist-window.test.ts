import assert from 'node:assert/strict'
import test from 'node:test'
import { PLAYLIST_WINDOW_ITEM_COUNT } from '../src/constants.js'
import { clampPlaylistWindowOffset, getPlaylistWindowItems, playlistItemVariable } from '../src/playlist-window.js'
import type { PlayoutModel, PlayoutPlayerModel, PlayoutProgramLogLineModel } from '../src/types.js'

function playlistLine(id: number, title: string): PlayoutProgramLogLineModel {
	return {
		artist: `Artist ${id}`,
		contentType: 'Track',
		duration: 180,
		file: `track-${id}.wav`,
		id,
		startNextItem: 170,
		startTime: '2026-06-01T12:00:00Z',
		stopPosition: 180,
		title,
	}
}

function player(id: number, playing: boolean, isNextItem: boolean): PlayoutPlayerModel {
	return {
		artist: `Artist ${id}`,
		cued: false,
		duration: 180,
		id,
		intro: 0,
		isNextItem,
		pfl: false,
		playing,
		position: 0,
		title: `Title ${id}`,
		trackId: id,
	}
}

test('getPlaylistWindowItems maps visible item numbers to playlist lines and player state', () => {
	const currentPlaylist = [playlistLine(10, 'First'), playlistLine(20, 'Second'), playlistLine(30, 'Third')]
	const playout: PlayoutModel = {
		players: [player(20, true, false), player(30, false, true)],
	}

	const items = getPlaylistWindowItems(currentPlaylist, playout, 1)

	assert.equal(items.length, PLAYLIST_WINDOW_ITEM_COUNT)
	assert.equal(items[0]?.item, 1)
	assert.equal(items[0]?.playlistIndex, 1)
	assert.equal(items[0]?.line?.id, 20)
	assert.equal(items[0]?.isPlaying, true)
	assert.equal(items[0]?.isNextItem, false)
	assert.equal(items[1]?.line?.id, 30)
	assert.equal(items[1]?.isPlaying, false)
	assert.equal(items[1]?.isNextItem, true)
	assert.equal(items[2]?.line, undefined)
})

test('clampPlaylistWindowOffset keeps the visible window inside the playlist', () => {
	const currentPlaylist = Array.from({ length: 20 }, (_, index) => playlistLine(index + 1, `Track ${index + 1}`))

	assert.equal(clampPlaylistWindowOffset(currentPlaylist, -5), 0)
	assert.equal(clampPlaylistWindowOffset(currentPlaylist, 3), 3)
	assert.equal(clampPlaylistWindowOffset(currentPlaylist, 999), 4)
	assert.equal(clampPlaylistWindowOffset(undefined, 999), 0)
})

test('playlistItemVariable creates stable Companion variable names', () => {
	assert.equal(playlistItemVariable(1, 'title'), 'playlist_item_1_title')
	assert.equal(playlistItemVariable(16, 'line_id'), 'playlist_item_16_line_id')
})
