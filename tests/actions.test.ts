import assert from 'node:assert/strict'
import test from 'node:test'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { UpdateActions } from '../src/actions.js'
import type { PowerStudioClient } from '../src/client.js'
import type ModuleInstance from '../src/main.js'
import type { ModuleSchema } from '../src/main.js'
import type { PlayerCommand, PlayoutPlayerModel, PowerStudioState, RecorderCommand } from '../src/types.js'

type ActionDefinitions = CompanionActionDefinitions<ModuleSchema['actions']>
type CueOrStopCallback = (event: { options: { player: number } }) => Promise<void>
type PlayerCommandCallback = (event: { options: { player: number; command: PlayerCommand } }) => Promise<void>
type RecorderCommandCallback = (event: { options: { command: RecorderCommand } }) => Promise<void>

test('player_cue_or_stop sends Stop when the player is playing', async () => {
	const calls = await runCueOrStopAction({
		playout: {
			players: [player({ playing: true })],
		},
	})

	assert.deepEqual(calls, [{ player: 0, command: 'Stop' }])
})

test('player_cue_or_stop sends Cue when the player is not playing', async () => {
	const calls = await runCueOrStopAction({
		playout: {
			players: [player({ playing: false })],
		},
	})

	assert.deepEqual(calls, [{ player: 0, command: 'Cue' }])
})

test('player_cue_or_stop refreshes playout state before choosing Cue or Stop', async () => {
	const state: PowerStudioState = {
		playout: {
			players: [player({ playing: true })],
		},
	}
	const calls = await runCueOrStopAction(state, async () => {
		state.playout = {
			players: [player({ playing: false })],
		}
	})

	assert.deepEqual(calls, [{ player: 0, command: 'Cue' }])
})

test('player_command maps Cue to the same smart cue-or-stop behavior for existing buttons', async () => {
	const playingState: PowerStudioState = {
		playout: {
			players: [player({ playing: true })],
		},
	}
	const stoppedState: PowerStudioState = {
		playout: {
			players: [player({ playing: false })],
		},
	}

	assert.deepEqual(await runPlayerCommandAction(playingState, 'Cue'), [{ player: 0, command: 'Stop' }])
	assert.deepEqual(await runPlayerCommandAction(stoppedState, 'Cue'), [{ player: 0, command: 'Cue' }])
})

test('player_command keeps non-Cue commands literal', async () => {
	const calls = await runPlayerCommandAction(
		{
			playout: {
				players: [player({ playing: true })],
			},
		},
		'Play',
	)

	assert.deepEqual(calls, [{ player: 0, command: 'Play' }])
})

test('recorder_command sends the selected Recorder command', async () => {
	const calls: RecorderCommand[] = []
	const client = {
		runRecorderCommand: async (command: RecorderCommand) => {
			calls.push(command)
		},
	}
	const definitions = getActionDefinitions({}, client as PowerStudioClient, async () => {})
	const definition = definitions.recorder_command

	assert.ok(definition && typeof definition === 'object')
	await (definition.callback as RecorderCommandCallback)({ options: { command: 'record_start' } })

	assert.deepEqual(calls, ['record_start'])
})

async function runCueOrStopAction(
	state: PowerStudioState,
	refreshStatus: () => Promise<void> = async () => {},
): Promise<Array<{ player: number; command: PlayerCommand }>> {
	const calls: Array<{ player: number; command: PlayerCommand }> = []
	const client = {
		setPlayerCommand: async (playerIndex: number, command: PlayerCommand) => {
			calls.push({ player: playerIndex, command })
		},
	}
	const definitions = getActionDefinitions(state, client as PowerStudioClient, refreshStatus)
	const definition = definitions.player_cue_or_stop

	assert.ok(definition && typeof definition === 'object')
	await (definition.callback as CueOrStopCallback)({ options: { player: 0 } })

	return calls
}

async function runPlayerCommandAction(
	state: PowerStudioState,
	command: PlayerCommand,
	refreshStatus: () => Promise<void> = async () => {},
): Promise<Array<{ player: number; command: PlayerCommand }>> {
	const calls: Array<{ player: number; command: PlayerCommand }> = []
	const client = {
		setPlayerCommand: async (playerIndex: number, sentCommand: PlayerCommand) => {
			calls.push({ player: playerIndex, command: sentCommand })
		},
	}
	const definitions = getActionDefinitions(state, client as PowerStudioClient, refreshStatus)
	const definition = definitions.player_command

	assert.ok(definition && typeof definition === 'object')
	await (definition.callback as PlayerCommandCallback)({ options: { player: 0, command } })

	return calls
}

function getActionDefinitions(
	state: PowerStudioState,
	client: PowerStudioClient,
	refreshStatus: () => Promise<void>,
): ActionDefinitions {
	let definitions: ActionDefinitions | undefined

	const self = {
		state,
		setActionDefinitions: (value: ActionDefinitions) => {
			definitions = value
		},
		runCommand: async (_label: string, _capability: string, command: (client: PowerStudioClient) => Promise<void>) => {
			await command(client)
		},
		refreshStatus,
		log: () => {},
	} as unknown as ModuleInstance

	UpdateActions(self)

	assert.ok(definitions)
	return definitions
}

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
