import { cartPlayerDisplayName, playerDisplayName } from './labels.js'
import type { CartsModel, CartsPlayerModel, PlayoutModel, PlayoutPlayerModel } from './types.js'

export type SelectedPlayer = {
	index: number
	name: string
	player: PlayoutPlayerModel
}

export function hasPlayerItem(player: PlayoutPlayerModel | undefined): boolean {
	if (!player) {
		return false
	}

	return (
		player.trackId > 0 ||
		player.duration > 0 ||
		String(player.artist ?? '').trim().length > 0 ||
		String(player.title ?? '').trim().length > 0
	)
}

export function selectFirstPlayingPlayer(playout: PlayoutModel | undefined): SelectedPlayer | undefined {
	return selectFirstPlayer(playout, (player) => player.playing === true)
}

export function selectNextPlayer(playout: PlayoutModel | undefined): SelectedPlayer | undefined {
	return selectFirstPlayer(playout, (player) => player.isNextItem === true)
}

export function isAnyPlayerPlaying(playout: PlayoutModel | undefined): boolean {
	return playout?.players?.some((player) => player.playing === true) ?? false
}

export function isAnyCartPlaying(carts: CartsModel | undefined): boolean {
	return carts?.carts?.some((cart) => cart?.playing === true) ?? false
}

export function selectFirstPlayingCart(
	carts: CartsModel | undefined,
): { index: number; name: string; cart: CartsPlayerModel } | undefined {
	const index = carts?.carts?.findIndex((cart) => cart?.playing === true) ?? -1
	const cart = index >= 0 ? carts?.carts?.[index] : undefined

	if (!cart) {
		return undefined
	}

	return {
		index,
		name: cartPlayerDisplayName(index),
		cart,
	}
}

function selectFirstPlayer(
	playout: PlayoutModel | undefined,
	predicate: (player: PlayoutPlayerModel) => boolean,
): SelectedPlayer | undefined {
	const index = playout?.players?.findIndex((player) => predicate(player)) ?? -1
	const player = index >= 0 ? playout?.players?.[index] : undefined

	if (!player) {
		return undefined
	}

	return {
		index,
		name: playerDisplayName(index),
		player,
	}
}
