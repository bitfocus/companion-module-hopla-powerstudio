export type Protocol = 'http' | 'https'

export type PlayerCommand = 'Play' | 'Stop' | 'Cue' | 'StopAndCue' | 'PflOn' | 'PflOff' | 'PflToggle'

export type PlayoutMode = 'Automation' | 'LiveAssist' | 'TrainingMode'

export type NextPlaylistTimeMode = 'None' | 'NextProgramLog' | 'TransferPlayoutControl'

export type OnAirState = 'OffAir' | 'OnAir'

export type CartPlayMode = 'Fire' | 'Select'

export type CartPlayerItemStatus = 'None' | 'Loaded' | 'Selected' | 'Playing'

export type ContentTypeType = 'Track' | 'Jingle' | 'Promo' | 'Spot' | 'VoiceTrack' | 'Misc'

export type ProgramLogLineType = 'FileContent' | 'LiveWebStream' | 'LiveInput'

export type MixEditorCommand =
	| 'play'
	| 'stop'
	| 'record'
	| 'save'
	| 'undo'
	| 'previousmix'
	| 'nextmix'
	| 'previousprofile'
	| 'nextprofile'
	| 'selectprofile'

export type RecorderCommand =
	| 'play'
	| 'stop'
	| 'record'
	| 'record_start'
	| 'record_stop'
	| 'previous_profile'
	| 'next_profile'
	| 'select_profile'

export type PlayerState = 'playing' | 'cued' | 'pfl' | 'isNextItem'

export type MixEditorState =
	| 'playing'
	| 'recording'
	| 'canPlay'
	| 'canStop'
	| 'canSave'
	| 'canUndo'
	| 'canGoPreviousMix'
	| 'canGoNextMix'
	| 'canRecordMix'
	| 'canPlayNext'

export type RecorderState =
	| 'playing'
	| 'recording'
	| 'stopped'
	| 'canPlay'
	| 'canStop'
	| 'canStartRecord'
	| 'canChangeProcessingProfile'

export type VersionInfo = {
	version?: string
	build?: string
}

export type UptimeInfo = {
	uptime?: string
}

export type PlayoutPlayerModel = {
	artist: string
	cued: boolean
	duration: number
	id: number
	intro: number
	isNextItem: boolean
	pfl: boolean
	playing: boolean
	position: number
	title: string
	trackId: number
}

export type PlayoutProgramLogLineModel = {
	artist: string
	contentType: ContentTypeType
	duration: number
	file: string
	fillOut?: boolean
	hasStartOffset?: boolean
	id: number
	intro?: number
	isMacroItem?: boolean
	lineType?: ProgramLogLineType
	linked?: boolean
	macroId?: string
	outro?: number
	realtimeDefinitionId?: number
	scheduled?: boolean
	startNextItem: number
	startOffset?: number
	startPosition?: number
	startPostion?: number
	startTime: string
	stopPosition: number
	title: string
	trackId?: number
}

export type PlayoutModel = {
	nextPlaylistTimeMode?: NextPlaylistTimeMode
	nextStartTime?: string
	onAirState?: OnAirState
	players?: PlayoutPlayerModel[]
	playoutMode?: PlayoutMode
}

export type RackItemModel = {
	status?: CartPlayerItemStatus
	title?: string
}

export type CartsPlayerModel = {
	duration: number
	playing: boolean
	playMode?: CartPlayMode
	position: number
	rack?: Array<RackItemModel | null>
}

export type CartsModel = {
	carts?: CartsPlayerModel[]
}

export type MixEditorModel = {
	canGoPreviousMix: boolean
	canGoNextMix: boolean
	canPlay: boolean
	canPlayNext: boolean
	canRecordMix: boolean
	canSave: boolean
	canStop: boolean
	canUndo: boolean
	playing: boolean
	recording: boolean
}

export type RecorderModel = {
	canChangeProcessingProfile: boolean
	canPlay: boolean
	canStartRecord: boolean
	canStop: boolean
	duration: number
	fileName?: string
	playing: boolean
	position: number
	recording: boolean
	stopped: boolean
}

export type TotalStatusModel = {
	carts?: CartsModel
	mixEditor?: MixEditorModel
	playout?: PlayoutModel
	recorder?: RecorderModel
	uptime?: string
	version?: VersionInfo
}

export type PowerStudioState = {
	version?: VersionInfo
	lastDetectedVersion?: VersionInfo
	capabilities?: import('./capabilities.js').PowerStudioCapabilities
	uptime?: UptimeInfo
	playout?: PlayoutModel
	currentPlaylist?: PlayoutProgramLogLineModel[]
	carts?: CartsModel
	mixEditor?: MixEditorModel
	recorder?: RecorderModel
	lastUpdated?: string
	lastStatusError?: string
	lastCommandError?: string
}
