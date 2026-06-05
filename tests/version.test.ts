import assert from 'node:assert/strict'
import test from 'node:test'
import { compareApiVersions, formatApiVersion, isAtLeastApiVersion, parseApiVersion } from '../src/version.js'

test('parseApiVersion parses semantic version strings', () => {
	assert.deepEqual(parseApiVersion('1.24.1'), {
		major: 1,
		minor: 24,
		patch: 1,
		raw: '1.24.1',
	})
})

test('parseApiVersion treats a missing patch version as zero', () => {
	assert.deepEqual(parseApiVersion('1.24'), {
		major: 1,
		minor: 24,
		patch: 0,
		raw: '1.24',
	})
})

test('parseApiVersion extracts a version from surrounding text', () => {
	assert.deepEqual(parseApiVersion('Power Studio API 2.3.4 build 567'), {
		major: 2,
		minor: 3,
		patch: 4,
		raw: 'Power Studio API 2.3.4 build 567',
	})
})

test('parseApiVersion returns undefined for missing or invalid values', () => {
	assert.equal(parseApiVersion(undefined), undefined)
	assert.equal(parseApiVersion('latest'), undefined)
})

test('compareApiVersions compares major, minor and patch numbers', () => {
	const version1241 = parseApiVersion('1.24.1')
	const version1242 = parseApiVersion('1.24.2')
	const version130 = parseApiVersion('1.30.0')

	assert.ok(version1241)
	assert.ok(version1242)
	assert.ok(version130)
	assert.equal(compareApiVersions(version1241, version1242), -1)
	assert.equal(compareApiVersions(version130, version1242), 6)
})

test('isAtLeastApiVersion checks minimum version support', () => {
	const actual = parseApiVersion('1.24.1')
	const minimum = parseApiVersion('1.24.0')
	const future = parseApiVersion('1.25.0')

	assert.ok(actual)
	assert.ok(minimum)
	assert.ok(future)
	assert.equal(isAtLeastApiVersion(actual, minimum), true)
	assert.equal(isAtLeastApiVersion(actual, future), false)
})

test('formatApiVersion formats parsed and unknown versions', () => {
	assert.equal(formatApiVersion(parseApiVersion('1.24')), '1.24.0')
	assert.equal(formatApiVersion(undefined), 'unknown')
})
