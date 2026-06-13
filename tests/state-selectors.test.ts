import assert from 'node:assert/strict'
import test from 'node:test'
import {
	hasPlayerItem,
	isAnyCartPlaying,
	isAnyPlayerPlaying,
	selectFirstPlayingCart,
	selectFirstPlayingPlayer,
	selectNextPlayer,
} from '../src/state-selectors.js'
import type { PlayoutPlayerModel } from '../src/types.js'

test('hasPlayerItem treats title, artist, duration or track id as loaded content', () => {
	assert.equal(hasPlayerItem(player({ title: '', artist: '', duration: 0, trackId: 0 })), false)
	assert.equal(hasPlayerItem(player({ title: 'Song', artist: '', duration: 0, trackId: 0 })), true)
	assert.equal(hasPlayerItem(player({ title: '', artist: 'Artist', duration: 0, trackId: 0 })), true)
	assert.equal(hasPlayerItem(player({ title: '', artist: '', duration: 120, trackId: 0 })), true)
	assert.equal(hasPlayerItem(player({ title: '', artist: '', duration: 0, trackId: 12 })), true)
})

test('player selectors expose first playing and next players', () => {
	const playout = {
		players: [
			player({ title: 'First', playing: false, isNextItem: false }),
			player({ title: 'Second', playing: true, isNextItem: false }),
			player({ title: 'Third', playing: false, isNextItem: true }),
		],
	}

	assert.equal(isAnyPlayerPlaying(playout), true)
	assert.equal(selectFirstPlayingPlayer(playout)?.name, 'Player B')
	assert.equal(selectFirstPlayingPlayer(playout)?.player.title, 'Second')
	assert.equal(selectNextPlayer(playout)?.name, 'Player C')
	assert.equal(selectNextPlayer(playout)?.player.title, 'Third')
})

test('cart selectors expose whether any cart is playing', () => {
	const carts = {
		carts: [
			{ duration: 0, playing: false, position: 0 },
			{ duration: 10, playing: true, position: 2 },
		],
	}

	assert.equal(isAnyCartPlaying(carts), true)
	assert.equal(selectFirstPlayingCart(carts)?.name, 'Cart B')
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
