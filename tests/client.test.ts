import assert from 'node:assert/strict'
import test from 'node:test'
import { PowerStudioClient } from '../src/client.js'
import { defaultConfig, type ModuleConfig } from '../src/config.js'
import { PowerStudioHttpError } from '../src/errors.js'

test('PowerStudioClient logs non-OK HTTP response status and body summary', async () => {
	const originalFetch = globalThis.fetch
	const logs: string[] = []

	globalThis.fetch = async () =>
		new Response('{"reason":"Automation mode"}', {
			status: 409,
			statusText: 'Conflict',
		})

	try {
		const client = new PowerStudioClient(config(), {}, (message) => logs.push(message))

		await assert.rejects(async () => client.setPlayerCommand(0, 'Cue'), PowerStudioHttpError)
		assert.deepEqual(logs, [
			'Power Studio HTTP response: POST /api/playout/player, request: {"player":0,"command":"Cue"} -> 409 Conflict, response: {"reason":"Automation mode"}',
		])
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('PowerStudioClient does not log OK HTTP responses for POST commands', async () => {
	const originalFetch = globalThis.fetch
	const logs: string[] = []

	globalThis.fetch = async () =>
		new Response('', {
			status: 200,
			statusText: 'OK',
		})

	try {
		const client = new PowerStudioClient(config(), {}, (message) => logs.push(message))

		await client.setPlayerCommand(0, 'Cue')
		assert.deepEqual(logs, [])
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('PowerStudioClient does not log OK HTTP responses for GET polling', async () => {
	const originalFetch = globalThis.fetch
	const logs: string[] = []

	globalThis.fetch = async () =>
		new Response('{"version":"1.24.1"}', {
			status: 200,
			statusText: 'OK',
		})

	try {
		const client = new PowerStudioClient(config(), {}, (message) => logs.push(message))

		await client.getVersion()
		assert.deepEqual(logs, [])
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('PowerStudioClient reads total status with the same Basic Auth as other endpoints', async () => {
	const originalFetch = globalThis.fetch
	const requests: Array<{ url: string; method?: string; authorization: string | null }> = []

	globalThis.fetch = async (input, init) => {
		const headers = new Headers(init?.headers)

		requests.push({
			url: requestUrl(input),
			method: init?.method,
			authorization: headers.get('Authorization'),
		})

		return new Response('{"uptime":"0:00:16:22,7816278","version":{"version":"1.24.1","build":"1569"}}', {
			status: 200,
			statusText: 'OK',
		})
	}

	try {
		const client = new PowerStudioClient({ ...config(), username: 'vincent' }, { password: '123' })
		const totalStatus = await client.getTotalStatus()

		assert.deepEqual(totalStatus, {
			uptime: '0:00:16:22,7816278',
			version: { version: '1.24.1', build: '1569' },
		})
		assert.deepEqual(requests, [
			{
				url: 'http://power-studio.local:9876/api/status/total',
				method: 'GET',
				authorization: 'Basic dmluY2VudDoxMjM=',
			},
		])
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('PowerStudioClient logs total status polling errors without naming the hidden endpoint', async () => {
	const originalFetch = globalThis.fetch
	const logs: string[] = []

	globalThis.fetch = async () =>
		new Response('{"reason":"Not found"}', {
			status: 404,
			statusText: 'Not Found',
		})

	try {
		const client = new PowerStudioClient(config(), {}, (message) => logs.push(message))

		await assert.rejects(async () => client.getTotalStatus(), PowerStudioHttpError)
		assert.deepEqual(logs, [
			'Power Studio HTTP response: GET status poll -> 404 Not Found, response: {"reason":"Not found"}',
		])
		assert.doesNotMatch(logs.join('\n'), /\/api\/status\/total/)
	} finally {
		globalThis.fetch = originalFetch
	}
})

test('PowerStudioClient sends recorder commands to their nested REST endpoints', async () => {
	const originalFetch = globalThis.fetch
	const requests: Array<{ url: string; method?: string }> = []

	globalThis.fetch = async (input, init) => {
		requests.push({ url: requestUrl(input), method: init?.method })

		return new Response('', {
			status: 200,
			statusText: 'OK',
		})
	}

	try {
		const client = new PowerStudioClient(config(), {})

		await client.runRecorderCommand('record_start')
		await client.runRecorderCommand('previous_profile')

		assert.deepEqual(requests, [
			{
				url: 'http://power-studio.local:9876/api/recorder/record/start',
				method: 'POST',
			},
			{
				url: 'http://power-studio.local:9876/api/recorder/profile/previous',
				method: 'POST',
			},
		])
	} finally {
		globalThis.fetch = originalFetch
	}
})

function requestUrl(input: Parameters<typeof fetch>[0]): string {
	if (typeof input === 'string') {
		return input
	}

	if (input instanceof URL) {
		return input.toString()
	}

	return input.url
}

function config(): ModuleConfig {
	return {
		...defaultConfig(),
		protocol: 'http',
		host: 'power-studio.local',
		port: 9876,
		basePath: '',
		username: '',
		pollInterval: 100,
		requestTimeout: 3000,
	}
}
