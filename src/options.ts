import type { DropdownChoice } from '@companion-module/base'
import { CART_PLAYER_COUNT, PLAYER_COUNT } from './constants.js'
import { cartPlayerDisplayName, playerDisplayName } from './labels.js'
import type {
	CartPlayerItemStatus,
	ContentTypeType,
	MixEditorCommand,
	MixEditorState,
	PlayerCommand,
	PlayerState,
	PlayoutMode,
	RecorderCommand,
	RecorderState,
} from './types.js'

export const PLAYER_CHOICES: DropdownChoice<number>[] = Array.from({ length: PLAYER_COUNT }, (_, player) => ({
	id: player,
	label: playerDisplayName(player),
}))

export const CART_PLAYER_CHOICES: DropdownChoice<number>[] = Array.from(
	{ length: CART_PLAYER_COUNT },
	(_, cartPlayerIndex) => ({
		id: cartPlayerIndex,
		label: cartPlayerDisplayName(cartPlayerIndex),
	}),
)

export const PLAYER_COMMAND_CHOICES: DropdownChoice[] = [
	{ id: 'Play', label: 'Play' },
	{ id: 'Stop', label: 'Stop' },
	{ id: 'Cue', label: 'Cue' },
	{ id: 'StopAndCue', label: 'Stop and cue' },
	{ id: 'PflOn', label: 'PFL on' },
	{ id: 'PflOff', label: 'PFL off' },
	{ id: 'PflToggle', label: 'PFL toggle' },
] satisfies Array<{ id: PlayerCommand; label: string }>

export const PLAYOUT_MODE_CHOICES: DropdownChoice[] = [
	{ id: 'Automation', label: 'Automation' },
	{ id: 'LiveAssist', label: 'Live Assist' },
	{ id: 'TrainingMode', label: 'Training Mode' },
] satisfies Array<{ id: PlayoutMode; label: string }>

export const MIX_EDITOR_COMMAND_CHOICES: DropdownChoice[] = [
	{ id: 'play', label: 'Play' },
	{ id: 'stop', label: 'Stop' },
	{ id: 'record', label: 'Record' },
	{ id: 'save', label: 'Save' },
	{ id: 'undo', label: 'Undo' },
	{ id: 'previousmix', label: 'Previous mix' },
	{ id: 'nextmix', label: 'Next mix' },
	{ id: 'previousprofile', label: 'Previous profile' },
	{ id: 'nextprofile', label: 'Next profile' },
	{ id: 'selectprofile', label: 'Select profile' },
] satisfies Array<{ id: MixEditorCommand; label: string }>

export const RECORDER_COMMAND_CHOICES: DropdownChoice[] = [
	{ id: 'play', label: 'Play' },
	{ id: 'stop', label: 'Stop playback or recording' },
	{ id: 'record', label: 'Toggle recording' },
	{ id: 'record_start', label: 'Start recording' },
	{ id: 'record_stop', label: 'Stop recording' },
	{ id: 'previous_profile', label: 'Previous profile' },
	{ id: 'next_profile', label: 'Next profile' },
	{ id: 'select_profile', label: 'Select profile' },
] satisfies Array<{ id: RecorderCommand; label: string }>

export const PLAYER_STATE_CHOICES: DropdownChoice[] = [
	{ id: 'playing', label: 'Playing' },
	{ id: 'cued', label: 'Cued' },
	{ id: 'pfl', label: 'PFL' },
	{ id: 'isNextItem', label: 'Is next item' },
] satisfies Array<{ id: PlayerState; label: string }>

export const CART_ITEM_STATUS_CHOICES: DropdownChoice[] = [
	{ id: 'None', label: 'None' },
	{ id: 'Loaded', label: 'Loaded' },
	{ id: 'Selected', label: 'Selected' },
	{ id: 'Playing', label: 'Playing' },
] satisfies Array<{ id: CartPlayerItemStatus; label: string }>

export const CONTENT_TYPE_CHOICES: DropdownChoice[] = [
	{ id: 'Track', label: 'Track' },
	{ id: 'Jingle', label: 'Jingle' },
	{ id: 'Promo', label: 'Promo' },
	{ id: 'Spot', label: 'Spot' },
	{ id: 'VoiceTrack', label: 'Voice Track' },
	{ id: 'Misc', label: 'Misc' },
] satisfies Array<{ id: ContentTypeType; label: string }>

export const MIX_EDITOR_STATE_CHOICES: DropdownChoice[] = [
	{ id: 'playing', label: 'Playing' },
	{ id: 'recording', label: 'Recording' },
	{ id: 'canPlay', label: 'Can play' },
	{ id: 'canStop', label: 'Can stop' },
	{ id: 'canSave', label: 'Can save' },
	{ id: 'canUndo', label: 'Can undo' },
	{ id: 'canGoPreviousMix', label: 'Can go previous mix' },
	{ id: 'canGoNextMix', label: 'Can go next mix' },
	{ id: 'canRecordMix', label: 'Can record mix' },
	{ id: 'canPlayNext', label: 'Can play next' },
] satisfies Array<{ id: MixEditorState; label: string }>

export const RECORDER_STATE_CHOICES: DropdownChoice[] = [
	{ id: 'playing', label: 'Playing' },
	{ id: 'recording', label: 'Recording' },
	{ id: 'stopped', label: 'Stopped' },
	{ id: 'canPlay', label: 'Can play' },
	{ id: 'canStop', label: 'Can stop' },
	{ id: 'canStartRecord', label: 'Can start recording' },
	{ id: 'canChangeProcessingProfile', label: 'Can change processing profile' },
] satisfies Array<{ id: RecorderState; label: string }>
