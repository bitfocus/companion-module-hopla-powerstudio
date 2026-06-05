import assert from 'node:assert/strict'
import test from 'node:test'
import {
	MIX_EDITOR_COMMAND_CHOICES,
	MIX_EDITOR_STATE_CHOICES,
	PLAYOUT_MODE_CHOICES,
	RECORDER_COMMAND_CHOICES,
	RECORDER_STATE_CHOICES,
} from '../src/options.js'

test('playout mode choices use Automation, Live Assist, Training Mode order', () => {
	assert.deepEqual(
		PLAYOUT_MODE_CHOICES.map((choice) => choice.id),
		['Automation', 'LiveAssist', 'TrainingMode'],
	)
	assert.deepEqual(
		PLAYOUT_MODE_CHOICES.map((choice) => choice.label),
		['Automation', 'Live Assist', 'Training Mode'],
	)
})

test('mix editor command choices use Previous before Next order', () => {
	assert.deepEqual(
		MIX_EDITOR_COMMAND_CHOICES.map((choice) => choice.id),
		[
			'play',
			'stop',
			'record',
			'save',
			'undo',
			'previousmix',
			'nextmix',
			'previousprofile',
			'nextprofile',
			'selectprofile',
		],
	)
	assert.deepEqual(
		MIX_EDITOR_COMMAND_CHOICES.map((choice) => choice.label),
		[
			'Play',
			'Stop',
			'Record',
			'Save',
			'Undo',
			'Previous mix',
			'Next mix',
			'Previous profile',
			'Next profile',
			'Select profile',
		],
	)
})

test('mix editor state choices use Previous before Next order', () => {
	assert.deepEqual(
		MIX_EDITOR_STATE_CHOICES.map((choice) => choice.id),
		[
			'playing',
			'recording',
			'canPlay',
			'canStop',
			'canSave',
			'canUndo',
			'canGoPreviousMix',
			'canGoNextMix',
			'canRecordMix',
			'canPlayNext',
		],
	)
})

test('recorder command choices match the Recorder REST endpoints', () => {
	assert.deepEqual(
		RECORDER_COMMAND_CHOICES.map((choice) => choice.id),
		['play', 'stop', 'record', 'record_start', 'record_stop', 'previous_profile', 'next_profile', 'select_profile'],
	)
	assert.deepEqual(
		RECORDER_COMMAND_CHOICES.map((choice) => choice.label),
		[
			'Play',
			'Stop playback or recording',
			'Toggle recording',
			'Start recording',
			'Stop recording',
			'Previous profile',
			'Next profile',
			'Select profile',
		],
	)
})

test('recorder state choices expose booleans returned by the Recorder API', () => {
	assert.deepEqual(
		RECORDER_STATE_CHOICES.map((choice) => choice.id),
		['playing', 'recording', 'stopped', 'canPlay', 'canStop', 'canStartRecord', 'canChangeProcessingProfile'],
	)
})
