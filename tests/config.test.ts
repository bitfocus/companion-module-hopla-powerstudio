import assert from 'node:assert/strict'
import test from 'node:test'
import {
	DEFAULT_POLL_INTERVAL,
	DEFAULT_REST_API_PORT,
	GetConfigFields,
	MIN_POLL_INTERVAL,
	defaultConfig,
} from '../src/config.js'

test('defaultConfig uses the Power Studio REST API plugin default port', () => {
	assert.equal(defaultConfig().port, DEFAULT_REST_API_PORT)
	assert.equal(defaultConfig().port, 9876)
})

test('port config field defaults to the Power Studio REST API plugin default port', () => {
	const portField = GetConfigFields().find((field) => field.id === 'port')

	assert.ok(portField)
	assert.equal(portField.type, 'number')
	assert.equal(portField.default, DEFAULT_REST_API_PORT)
})

test('poll interval defaults to 500 ms and allows 100 ms as minimum', () => {
	const pollIntervalField = GetConfigFields().find((field) => field.id === 'pollInterval')

	assert.equal(defaultConfig().pollInterval, DEFAULT_POLL_INTERVAL)
	assert.equal(DEFAULT_POLL_INTERVAL, 500)
	assert.equal(MIN_POLL_INTERVAL, 100)
	assert.ok(pollIntervalField)
	assert.equal(pollIntervalField.type, 'number')
	assert.equal(pollIntervalField.default, DEFAULT_POLL_INTERVAL)
	assert.equal(pollIntervalField.min, MIN_POLL_INTERVAL)
	assert.equal(pollIntervalField.step, 50)
})

test('preset title visibility options default to showing titles', () => {
	const config = defaultConfig()

	assert.equal(config.showCartRackPresetTitles, true)
	assert.equal(config.showPlayerTransportPresetTitles, true)
	assert.equal(config.showPlaylistWindowPresetTitles, true)

	for (const fieldId of [
		'showCartRackPresetTitles',
		'showPlayerTransportPresetTitles',
		'showPlaylistWindowPresetTitles',
	]) {
		const field = GetConfigFields().find((entry) => entry.id === fieldId)

		assert.ok(field, `${fieldId} should exist`)
		assert.equal(field.type, 'checkbox')
		assert.equal(field.default, true)
	}
})
