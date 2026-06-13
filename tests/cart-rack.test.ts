import assert from 'node:assert/strict'
import test from 'node:test'
import {
	cartRackSlotStatusVariable,
	cartRackSlotTitleVariable,
	getCartRackItems,
	getCartRackLayoutFingerprint,
	rackItemDisplayNumber,
	rackItemIndexFromDisplayNumber,
} from '../src/cart-rack.js'
import { CART_PLAYER_COUNT, RACK_ITEM_COUNT } from '../src/constants.js'
import type { CartsModel } from '../src/types.js'

test('getCartRackItems always returns seven slots for two cart players', () => {
	const items = getCartRackItems(undefined)

	assert.equal(items.length, CART_PLAYER_COUNT * RACK_ITEM_COUNT)
	assert.deepEqual(items[0], {
		cartPlayerIndex: 0,
		rackItemIndex: 0,
		title: '',
		status: 'None',
	})
	assert.deepEqual(items.at(-1), {
		cartPlayerIndex: 1,
		rackItemIndex: 6,
		title: '',
		status: 'None',
	})
})

test('getCartRackItems trims titles and treats empty slots as None', () => {
	const carts: CartsModel = {
		carts: [
			{
				duration: 10,
				playing: false,
				position: 0,
				rack: [{ title: '  Sweeper  ', status: 'Loaded' }, null, { title: 'Hit', status: 'Playing' }],
			},
		],
	}

	const items = getCartRackItems(carts)

	assert.deepEqual(items[0], {
		cartPlayerIndex: 0,
		rackItemIndex: 0,
		title: 'Sweeper',
		status: 'Loaded',
	})
	assert.deepEqual(items[1], {
		cartPlayerIndex: 0,
		rackItemIndex: 1,
		title: '',
		status: 'None',
	})
	assert.deepEqual(items[2], {
		cartPlayerIndex: 0,
		rackItemIndex: 2,
		title: 'Hit',
		status: 'Playing',
	})
})

test('cart rack helper functions convert API indexes to Companion-facing names', () => {
	assert.equal(rackItemDisplayNumber(0), 1)
	assert.equal(rackItemDisplayNumber(6), 7)
	assert.equal(rackItemIndexFromDisplayNumber(1), 0)
	assert.equal(rackItemIndexFromDisplayNumber(7), 6)
	assert.equal(cartRackSlotTitleVariable(0, 0), 'cart_a_slot_1_title')
	assert.equal(cartRackSlotStatusVariable(1, 6), 'cart_b_slot_7_status')
})

test('getCartRackLayoutFingerprint stays tied to cart and slot positions', () => {
	const fingerprint = getCartRackLayoutFingerprint(undefined)

	assert.equal(fingerprint.split('|').length, CART_PLAYER_COUNT * RACK_ITEM_COUNT)
	assert.equal(fingerprint.startsWith('0:0|0:1|0:2'), true)
	assert.equal(fingerprint.endsWith('1:4|1:5|1:6'), true)
})
