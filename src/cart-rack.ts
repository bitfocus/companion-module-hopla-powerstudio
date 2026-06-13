import { CART_PLAYER_COUNT, RACK_ITEM_COUNT } from './constants.js'
import { cartPlayerKey } from './labels.js'
import type { CartPlayerItemStatus, CartsModel } from './types.js'

export type CartRackItem = {
	cartPlayerIndex: number
	rackItemIndex: number
	title: string
	status: CartPlayerItemStatus
}

export function getCartRackItems(carts: CartsModel | undefined): CartRackItem[] {
	const items: CartRackItem[] = []

	for (let cartPlayerIndex = 0; cartPlayerIndex < CART_PLAYER_COUNT; cartPlayerIndex++) {
		const rack = carts?.carts?.[cartPlayerIndex]?.rack ?? []

		for (let rackItemIndex = 0; rackItemIndex < RACK_ITEM_COUNT; rackItemIndex++) {
			const rackItem = rack[rackItemIndex]
			items.push({
				cartPlayerIndex,
				rackItemIndex,
				title: rackItem?.title?.trim() ?? '',
				status: rackItem?.status ?? 'None',
			})
		}
	}

	return items
}

export function getCartRackLayoutFingerprint(carts: CartsModel | undefined): string {
	return getCartRackItems(carts)
		.map((item) => `${item.cartPlayerIndex}:${item.rackItemIndex}`)
		.join('|')
}

export function cartRackSlotTitleVariable(cartPlayerIndex: number, rackItemIndex: number): string {
	return `cart_${cartPlayerKey(cartPlayerIndex)}_slot_${rackItemDisplayNumber(rackItemIndex)}_title`
}

export function cartRackSlotStatusVariable(cartPlayerIndex: number, rackItemIndex: number): string {
	return `cart_${cartPlayerKey(cartPlayerIndex)}_slot_${rackItemDisplayNumber(rackItemIndex)}_status`
}

export function rackItemDisplayNumber(rackItemIndex: number): number {
	return rackItemIndex + 1
}

export function rackItemIndexFromDisplayNumber(rackItemDisplayNumber: number): number {
	return rackItemDisplayNumber - 1
}
