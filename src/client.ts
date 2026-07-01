import type { ModuleConfig, ModuleSecrets } from './config.js'
import {
	PowerStudioHttpError,
	PowerStudioInvalidJsonError,
	PowerStudioNetworkError,
	PowerStudioRequestAbortedError,
	PowerStudioTimeoutError,
	type PowerStudioRequestContext,
	type PowerStudioRequestMethod,
} from './errors.js'
import type {
	CartsModel,
	MixEditorCommand,
	MixEditorModel,
	PlayerCommand,
	PlayoutProgramLogLineModel,
	PlayoutMode,
	PlayoutModel,
	RecorderCommand,
	RecorderModel,
	TotalStatusModel,
	UptimeInfo,
	VersionInfo,
} from './types.js'

export type PowerStudioClientLog = (message: string) => void
export type PowerStudioRequestOptions = {
	signal?: AbortSignal
}

const RECORDER_COMMAND_PATHS: Record<RecorderCommand, string> = {
	play: '/api/recorder/play',
	stop: '/api/recorder/stop',
	record: '/api/recorder/record',
	record_start: '/api/recorder/record/start',
	record_stop: '/api/recorder/record/stop',
	previous_profile: '/api/recorder/profile/previous',
	next_profile: '/api/recorder/profile/next',
	select_profile: '/api/recorder/profile/select',
}

export class PowerStudioClient {
	constructor(
		private readonly config: ModuleConfig,
		private readonly secrets: ModuleSecrets,
		private readonly log: PowerStudioClientLog = () => {},
	) {}

	async getVersion(options: PowerStudioRequestOptions = {}): Promise<VersionInfo> {
		return this.getJson<VersionInfo>('/api/application/version', options)
	}

	async getTotalStatus(options: PowerStudioRequestOptions = {}): Promise<TotalStatusModel> {
		return this.getJson<TotalStatusModel>('/api/status/total', options)
	}

	async getUptime(options: PowerStudioRequestOptions = {}): Promise<UptimeInfo> {
		return this.getJson<UptimeInfo>('/api/application/uptime', options)
	}

	async getPlayout(options: PowerStudioRequestOptions = {}): Promise<PlayoutModel> {
		return this.getJson<PlayoutModel>('/api/playout', options)
	}

	async getCarts(options: PowerStudioRequestOptions = {}): Promise<CartsModel> {
		return this.getJson<CartsModel>('/api/carts', options)
	}

	async getMixEditor(options: PowerStudioRequestOptions = {}): Promise<MixEditorModel> {
		return this.getJson<MixEditorModel>('/api/mixeditor', options)
	}

	async getRecorder(options: PowerStudioRequestOptions = {}): Promise<RecorderModel> {
		return this.getJson<RecorderModel>('/api/recorder', options)
	}

	async getCurrentPlaylist(options: PowerStudioRequestOptions = {}): Promise<PlayoutProgramLogLineModel[]> {
		return this.getJson<PlayoutProgramLogLineModel[]>('/api/playlist/current', options)
	}

	async setPlayerCommand(player: number, command: PlayerCommand): Promise<void> {
		await this.postJson('/api/playout/player', { player, command })
	}

	async setPlayoutMode(playoutMode: PlayoutMode): Promise<void> {
		await this.postJson('/api/playout/mode', { playoutMode })
	}

	async loadNextPlaylist(): Promise<void> {
		await this.postJson('/api/playout/next')
	}

	async refreshPlayout(): Promise<void> {
		await this.postJson('/api/playout/refresh')
	}

	async setNextItem(nextLineId: number): Promise<void> {
		await this.postJson('/api/playout/nextitem', { nextLineId })
	}

	async triggerCart(cartPlayerIndex: number, rackItemIndex: number): Promise<void> {
		await this.postJson('/api/carts/trigger', { cartPlayerIndex, rackItemIndex })
	}

	async stopCart(cartPlayerIndex: number): Promise<void> {
		await this.postJson('/api/carts/stop', { cartPlayerIndex })
	}

	async runMixEditorCommand(command: MixEditorCommand): Promise<void> {
		await this.postJson(`/api/mixeditor/${command}`)
	}

	async runRecorderCommand(command: RecorderCommand): Promise<void> {
		await this.postJson(RECORDER_COMMAND_PATHS[command])
	}

	private async getJson<T>(path: string, options: PowerStudioRequestOptions = {}): Promise<T> {
		return this.request<T>('GET', path, undefined, options)
	}

	private async postJson<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>('POST', path, body)
	}

	private async request<T>(
		method: PowerStudioRequestMethod,
		path: string,
		body?: unknown,
		options: PowerStudioRequestOptions = {},
	): Promise<T> {
		const url = this.buildUrl(path)
		const context: PowerStudioRequestContext = { method, path, url }
		const controller = new AbortController()
		let didTimeout = false
		const timeout = setTimeout(() => {
			didTimeout = true
			controller.abort()
		}, this.config.requestTimeout)
		const requestBody = body === undefined ? undefined : JSON.stringify(body)
		const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal

		try {
			const response = await fetch(url, {
				method,
				headers: this.buildHeaders(body !== undefined),
				body: requestBody,
				signal,
			})

			const text = await response.text()

			if (!response.ok) {
				this.log(describeHttpResponse(context, response.status, response.statusText, requestBody, text))
				throw new PowerStudioHttpError(context, response.status, response.statusText, text)
			}

			if (!text) {
				return undefined as T
			}

			try {
				return JSON.parse(text) as T
			} catch (error) {
				throw new PowerStudioInvalidJsonError(context, text, error)
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				if (didTimeout) {
					throw new PowerStudioTimeoutError(context, this.config.requestTimeout)
				}

				throw new PowerStudioRequestAbortedError(context)
			}

			if (error instanceof PowerStudioHttpError || error instanceof PowerStudioInvalidJsonError) {
				throw error
			}

			if (error instanceof PowerStudioTimeoutError) {
				throw error
			}

			throw new PowerStudioNetworkError(context, error)
		} finally {
			clearTimeout(timeout)
		}
	}

	private buildHeaders(hasBody: boolean): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: 'application/json',
		}

		if (hasBody) {
			headers['Content-Type'] = 'application/json'
		}

		if (this.config.username) {
			const token = Buffer.from(`${this.config.username}:${this.secrets.password ?? ''}`).toString('base64')
			headers.Authorization = `Basic ${token}`
		}

		return headers
	}

	private buildUrl(path: string): string {
		const host = this.config.host.trim()
		const basePath = normalizePath(this.config.basePath)
		const apiPath = normalizePath(path)

		return `${this.config.protocol}://${host}:${this.config.port}${basePath}${apiPath}`
	}
}

function describeHttpResponse(
	context: PowerStudioRequestContext,
	statusCode: number,
	statusText: string,
	requestBody: string | undefined,
	responseBody: string,
): string {
	const requestSummary = requestBody ? `, request: ${summarizeText(requestBody)}` : ''
	const responseSummary = summarizeText(responseBody)
	const responseText = responseSummary ? `, response: ${responseSummary}` : ''
	const requestTarget = describeRequestTarget(context)

	return `Power Studio HTTP response: ${requestTarget}${requestSummary} -> ${statusCode} ${statusText}${responseText}`
}

function describeRequestTarget(context: PowerStudioRequestContext): string {
	if (context.method === 'GET' && context.path === '/api/status/total') {
		return 'GET status poll'
	}

	return `${context.method} ${context.path}`
}

function summarizeText(value: string): string {
	const normalized = value.trim().replace(/\s+/g, ' ')

	if (!normalized) {
		return ''
	}

	return normalized.length > 300 ? `${normalized.slice(0, 300)}...` : normalized
}

function normalizePath(value: string): string {
	const trimmed = value.trim()

	if (!trimmed || trimmed === '/') {
		return ''
	}

	return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
