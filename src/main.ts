import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { UpdateActions, type ActionsSchema } from './actions.js'
import {
	buildCapabilities,
	describeUnsupportedApiVersion,
	describeUnsupportedCapability,
	type CapabilityKey,
	type PowerStudioCapabilities,
} from './capabilities.js'
import { getCartRackLayoutFingerprint } from './cart-rack.js'
import { PowerStudioClient } from './client.js'
import { defaultConfig, GetConfigFields, MIN_POLL_INTERVAL, type ModuleConfig, type ModuleSecrets } from './config.js'
import { describePowerStudioError } from './errors.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { clampPlaylistWindowOffset, getPlaylistWindowItems } from './playlist-window.js'
import { UpdatePresets } from './presets.js'
import type { PlayoutProgramLogLineModel, PowerStudioState, TotalStatusModel } from './types.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateVariableDefinitions, UpdateVariableValues, type VariablesSchema } from './variables.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config: ModuleConfig = defaultConfig()
	secrets: ModuleSecrets = {}
	client: PowerStudioClient | undefined
	state: PowerStudioState = {}

	private pollTimer: NodeJS.Timeout | undefined
	private connectionStatus = 'Not configured'
	private connectionOk = false
	private reportedConnectionStatus: InstanceStatus | undefined
	private reportedConnectionMessage: string | undefined
	private lastErrorMessage: string | undefined
	private cartRackLayoutFingerprint = ''
	private playlistWindowOffset = 0

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		await this.configUpdated(config, secrets)
	}

	async destroy(): Promise<void> {
		this.stopPolling()
		this.client = undefined
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.stopPolling()

		this.config = {
			...defaultConfig(),
			...config,
		}
		this.secrets = secrets ?? {}
		this.state = {
			capabilities: buildCapabilities(undefined),
		}
		this.connectionOk = false
		this.reportedConnectionStatus = undefined
		this.reportedConnectionMessage = undefined
		this.cartRackLayoutFingerprint = ''
		this.playlistWindowOffset = 0

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()

		if (!this.config.host.trim()) {
			this.client = undefined
			this.setConnectionStatus(InstanceStatus.BadConfig, 'Power Studio host is required')
			return
		}

		this.client = new PowerStudioClient(this.config, this.secrets, (message) => console.log(message))
		this.setConnectionStatus(InstanceStatus.Connecting, 'Connecting')
		this.startPolling()
		void this.refreshStatus()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	async refreshStatus(): Promise<void> {
		const client = this.client

		if (!client) {
			this.setConnectionStatus(InstanceStatus.BadConfig, 'Power Studio host is required')
			return
		}

		const totalStatusResult = await Promise.allSettled([client.getTotalStatus()])

		if (totalStatusResult[0].status === 'rejected') {
			this.handleStatusRefreshError(totalStatusResult[0].reason)
			return
		}

		const totalStatus = totalStatusResult[0].value

		this.applyTotalStatusVersion(totalStatus)

		const capabilities = this.state.capabilities ?? buildCapabilities(this.state.version)

		if (!capabilities.supportedApiVersion) {
			const message = describeUnsupportedApiVersion(capabilities)

			this.clearFunctionalState()
			this.state.lastStatusError = message
			this.state.lastUpdated = new Date().toISOString()
			this.logRequestError('warn', 'Power Studio API version is not supported', message)
			this.setConnectionStatus(InstanceStatus.BadConfig, message)
			return
		}

		this.applyTotalStatus(totalStatus, capabilities)

		const playlistResult = capabilities.features.playlist ? await Promise.allSettled([client.getCurrentPlaylist()]) : []

		const playlistFailure = playlistResult.find((result) => result.status === 'rejected')

		if (playlistResult[0]?.status === 'fulfilled') {
			this.state.currentPlaylist = playlistResult[0].value
		}

		if (playlistFailure?.status === 'rejected') {
			const description = describePowerStudioError(playlistFailure.reason, 'poll')

			this.state.lastStatusError = description.message
			this.log(description.logLevel, `Partial Power Studio status refresh failed: ${description.message}`)
		} else {
			this.state.lastStatusError = ''
		}

		this.updateDynamicDefinitions()
		this.playlistWindowOffset = clampPlaylistWindowOffset(this.state.currentPlaylist, this.playlistWindowOffset)

		this.state.lastUpdated = new Date().toISOString()
		this.setConnectionStatus(InstanceStatus.Ok, 'Connected')
		this.checkAllFeedbacks()
	}

	private applyTotalStatusVersion(totalStatus: TotalStatusModel): void {
		this.state.version = totalStatus.version

		if (totalStatus.version) {
			this.state.lastDetectedVersion = totalStatus.version
		}

		this.setCapabilities(buildCapabilities(totalStatus.version))
	}

	private applyTotalStatus(totalStatus: TotalStatusModel, capabilities: PowerStudioCapabilities): void {
		if (capabilities.features.applicationStatus) {
			this.state.uptime = { uptime: totalStatus.uptime ?? '' }
		}

		if (capabilities.features.playoutState) {
			this.state.playout = totalStatus.playout
		}

		if (capabilities.features.mixEditor) {
			this.state.mixEditor = totalStatus.mixEditor
		}

		if (capabilities.features.recorder) {
			this.state.recorder = totalStatus.recorder
		}

		if (capabilities.features.carts) {
			this.state.carts = totalStatus.carts
		}
	}

	async runCommand(
		label: string,
		capability: CapabilityKey,
		command: (client: PowerStudioClient) => Promise<void>,
	): Promise<void> {
		const client = this.client

		if (!client) {
			throw new Error('Power Studio client is not configured')
		}

		try {
			this.assertCapability(capability)
			await command(client)
			this.state.lastCommandError = ''
			await this.refreshStatus()
		} catch (error) {
			this.handleCommandError(label, error)
			throw error
		}
	}

	async setNextPlaylistWindowItem(item: number): Promise<void> {
		await this.runCommand(`set playlist item ${item} next`, 'playlist', async (client) => {
			const line = this.getPlaylistWindowLine(item)

			if (!line) {
				throw new Error(`Playlist window item ${item} is empty`)
			}

			await client.setNextItem(line.id)
		})
	}

	setPlaylistWindowOffset(offset: number): void {
		this.playlistWindowOffset = clampPlaylistWindowOffset(this.state.currentPlaylist, offset)
		UpdateVariableValues(this, this.connectionStatus)
		this.checkAllFeedbacks()
	}

	shiftPlaylistWindow(delta: number): void {
		this.setPlaylistWindowOffset(this.playlistWindowOffset + delta)
	}

	getPlaylistWindowOffset(): number {
		return this.playlistWindowOffset
	}

	getPlaylistWindowLine(item: number): PlayoutProgramLogLineModel | undefined {
		const index = this.playlistWindowOffset + item - 1

		return this.state.currentPlaylist?.[index]
	}

	getPlaylistWindowItems(): ReturnType<typeof getPlaylistWindowItems> {
		return getPlaylistWindowItems(this.state.currentPlaylist, this.state.playout, this.playlistWindowOffset)
	}

	isConnectionOk(): boolean {
		return this.connectionOk
	}

	private startPolling(): void {
		const interval = Math.max(MIN_POLL_INTERVAL, this.config.pollInterval)

		this.pollTimer = setInterval(() => {
			void this.refreshStatus()
		}, interval)
	}

	private stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	private setConnectionStatus(status: InstanceStatus, message: string): void {
		this.connectionStatus = message
		this.connectionOk = status === InstanceStatus.Ok
		this.lastErrorMessage = status === InstanceStatus.Ok ? undefined : this.lastErrorMessage

		if (this.reportedConnectionStatus !== status || this.reportedConnectionMessage !== message) {
			this.updateStatus(status, message)
			this.reportedConnectionStatus = status
			this.reportedConnectionMessage = message
		}

		UpdateVariableValues(this, this.connectionStatus)
		this.checkAllFeedbacks()
	}

	private setCapabilities(capabilities: PowerStudioCapabilities): void {
		const previousFingerprint = this.state.capabilities?.fingerprint

		this.state.capabilities = capabilities

		if (previousFingerprint && previousFingerprint !== capabilities.fingerprint) {
			this.log('info', `Power Studio API capabilities changed: ${capabilities.supportedLabels.join(', ')}`)
			this.updateActions()
			this.updateFeedbacks()
			this.updatePresets()
		}
	}

	private updateDynamicDefinitions(): void {
		const cartRackLayoutFingerprint = getCartRackLayoutFingerprint(this.state.carts)

		if (cartRackLayoutFingerprint === this.cartRackLayoutFingerprint) {
			return
		}

		this.cartRackLayoutFingerprint = cartRackLayoutFingerprint
		this.updateVariableDefinitions()
		this.updatePresets()
	}

	private clearFunctionalState(): void {
		delete this.state.uptime
		delete this.state.playout
		delete this.state.mixEditor
		delete this.state.recorder
		delete this.state.currentPlaylist
		delete this.state.carts
		this.playlistWindowOffset = 0
		this.updateDynamicDefinitions()
	}

	private assertCapability(capability: CapabilityKey): void {
		const capabilities = this.state.capabilities ?? buildCapabilities(this.state.version)

		if (capabilities.features[capability]) {
			return
		}

		const message = describeUnsupportedCapability(capabilities, capability)
		this.log('warn', message)
		throw new Error(message)
	}

	private handleStatusRefreshError(error: unknown): void {
		const description = describePowerStudioError(error, 'poll')

		this.clearFunctionalState()
		this.state.lastStatusError = description.message
		this.logRequestError(description.logLevel, 'Power Studio status refresh failed', description.message)
		this.setConnectionStatus(description.status, description.message)
	}

	private handleCommandError(label: string, error: unknown): void {
		const description = describePowerStudioError(error, 'command')

		this.state.lastCommandError = description.message
		this.logRequestError(description.logLevel, `Power Studio ${label} failed`, description.message)
		this.setConnectionStatus(description.status, description.message)
	}

	private logRequestError(logLevel: 'warn' | 'error', prefix: string, message: string): void {
		const fullMessage = `${prefix}: ${message}`

		if (fullMessage !== this.lastErrorMessage) {
			this.log(logLevel, fullMessage)
			this.lastErrorMessage = fullMessage
		}
	}
}
