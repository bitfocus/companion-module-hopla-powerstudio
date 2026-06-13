import assert from 'node:assert/strict'
import test from 'node:test'
import {
	CAPABILITY_DEFINITIONS,
	MINIMUM_SUPPORTED_API_VERSION,
	buildCapabilities,
	describeUnsupportedApiVersion,
	describeUnsupportedCapability,
	type CapabilityKey,
} from '../src/capabilities.js'

const allCapabilityKeys = Object.keys(CAPABILITY_DEFINITIONS) as CapabilityKey[]

test('buildCapabilities enables all current features for the minimum supported version', () => {
	const capabilities = buildCapabilities({ version: MINIMUM_SUPPORTED_API_VERSION })

	assert.equal(capabilities.apiVersionText, MINIMUM_SUPPORTED_API_VERSION)
	assert.equal(capabilities.minimumSupportedVersion, MINIMUM_SUPPORTED_API_VERSION)
	assert.equal(capabilities.supportedApiVersion, true)

	for (const key of allCapabilityKeys) {
		assert.equal(capabilities.features[key], true, `${key} should be enabled`)
	}
})

test('buildCapabilities disables current features for older API versions', () => {
	const capabilities = buildCapabilities({ version: '1.24.0' })

	assert.equal(capabilities.supportedApiVersion, false)

	for (const key of allCapabilityKeys) {
		assert.equal(capabilities.features[key], false, `${key} should be disabled`)
	}
})

test('buildCapabilities keeps conservative defaults when the API version is unknown', () => {
	const capabilities = buildCapabilities(undefined)

	assert.equal(capabilities.apiVersionText, 'unknown')
	assert.equal(capabilities.supportedApiVersion, true)

	for (const key of allCapabilityKeys) {
		assert.equal(capabilities.features[key], true, `${key} should use the unknown-version default`)
	}
})

test('describeUnsupportedCapability includes the required and current API versions', () => {
	const capabilities = buildCapabilities({ version: '1.24.0' })
	const message = describeUnsupportedCapability(capabilities, 'carts')

	assert.match(message, /Carts requires Power Studio API 1\.24\.1 or newer/)
	assert.match(message, /Current API version: 1\.24\.0/)
})

test('describeUnsupportedApiVersion returns the user-facing minimum version message', () => {
	const capabilities = buildCapabilities({ version: '1.24.0' })

	assert.equal(describeUnsupportedApiVersion(capabilities), 'Power Studio version 1.24.1 or newer is required')
})
