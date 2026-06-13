import assert from 'node:assert/strict'
import test from 'node:test'
import { InstanceStatus } from '@companion-module/base'
import {
	PowerStudioHttpError,
	PowerStudioInvalidJsonError,
	PowerStudioNetworkError,
	PowerStudioTimeoutError,
	describePowerStudioError,
	formatUnknownError,
	type PowerStudioRequestContext,
} from '../src/errors.js'

const context: PowerStudioRequestContext = {
	method: 'GET',
	path: '/api/status/total',
	url: 'http://power-studio.local:80/api/status/total',
}

test('describePowerStudioError maps authentication failures to Companion auth status', () => {
	const description = describePowerStudioError(new PowerStudioHttpError(context, 401, 'Unauthorized', ''), 'poll')

	assert.equal(description.status, InstanceStatus.AuthenticationFailure)
	assert.equal(description.logLevel, 'error')
	assert.equal(description.isConnectionProblem, false)
	assert.match(description.message, /username or password/)
	assert.doesNotMatch(description.message, /\/api\/status\/total/)
})

test('describePowerStudioError treats polling 404 as bad configuration without naming the endpoint', () => {
	const description = describePowerStudioError(new PowerStudioHttpError(context, 404, 'Not Found', ''), 'poll')

	assert.equal(description.status, InstanceStatus.BadConfig)
	assert.equal(description.logLevel, 'error')
	assert.match(description.message, /Could not retrieve values from the Power Studio REST API/)
	assert.match(description.message, /host, port and path prefix/)
	assert.doesNotMatch(description.message, /\/api\/status\/total/)
})

test('describePowerStudioError treats command 404 as a command warning', () => {
	const description = describePowerStudioError(new PowerStudioHttpError(context, 404, 'Not Found', ''), 'command')

	assert.equal(description.status, InstanceStatus.UnknownWarning)
	assert.equal(description.logLevel, 'warn')
	assert.match(description.message, /could not find the requested item/)
})

test('describePowerStudioError treats command conflicts as warnings', () => {
	const description = describePowerStudioError(
		new PowerStudioHttpError(context, 409, 'Conflict', '{"reason":"Automation mode"}'),
		'command',
	)

	assert.equal(description.status, InstanceStatus.UnknownWarning)
	assert.equal(description.logLevel, 'warn')
	assert.match(description.message, /current state/)
	assert.match(description.message, /reason: Automation mode/)
})

test('describePowerStudioError maps timeout and network errors to connection failures', () => {
	const timeoutDescription = describePowerStudioError(new PowerStudioTimeoutError(context, 3000), 'poll')
	const networkDescription = describePowerStudioError(
		new PowerStudioNetworkError(context, new Error('ECONNREFUSED')),
		'poll',
	)

	assert.equal(timeoutDescription.status, InstanceStatus.ConnectionFailure)
	assert.equal(timeoutDescription.isConnectionProblem, true)
	assert.match(timeoutDescription.message, /3000 ms/)
	assert.doesNotMatch(timeoutDescription.message, /\/api\/status\/total/)
	assert.equal(networkDescription.status, InstanceStatus.ConnectionFailure)
	assert.equal(networkDescription.isConnectionProblem, true)
	assert.match(networkDescription.message, /http:\/\/power-studio.local/)
	assert.doesNotMatch(networkDescription.message, /\/api\/status\/total/)
})

test('describePowerStudioError maps invalid JSON to an unknown error', () => {
	const description = describePowerStudioError(new PowerStudioInvalidJsonError(context, '<html>', undefined), 'poll')

	assert.equal(description.status, InstanceStatus.UnknownError)
	assert.equal(description.isConnectionProblem, false)
	assert.match(description.message, /invalid JSON/)
	assert.doesNotMatch(description.message, /\/api\/status\/total/)
})

test('formatUnknownError handles Error and non-Error values', () => {
	assert.equal(formatUnknownError(new Error('Boom')), 'Boom')
	assert.equal(formatUnknownError('plain failure'), 'plain failure')
})
