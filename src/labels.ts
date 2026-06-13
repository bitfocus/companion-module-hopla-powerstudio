const PLAYER_LABELS = ['A', 'B', 'C', 'D'] as const
const CART_PLAYER_LABELS = ['A', 'B'] as const

export function playerLabel(player: number): string {
	return PLAYER_LABELS[player] ?? String(player)
}

export function playerKey(player: number): string {
	return playerLabel(player).toLowerCase()
}

export function cartPlayerLabel(cartPlayerIndex: number): string {
	return CART_PLAYER_LABELS[cartPlayerIndex] ?? String(cartPlayerIndex)
}

export function cartPlayerKey(cartPlayerIndex: number): string {
	return cartPlayerLabel(cartPlayerIndex).toLowerCase()
}

export function playerDisplayName(player: number): string {
	return `Player ${playerLabel(player)}`
}

export function cartPlayerDisplayName(cartPlayerIndex: number): string {
	return `Cart ${cartPlayerLabel(cartPlayerIndex)}`
}

export function playerVariable(player: number, field: string): string {
	return `player_${playerKey(player)}_${field}`
}

export function cartPlayerVariable(cartPlayerIndex: number, field: string): string {
	return `cart_${cartPlayerKey(cartPlayerIndex)}_${field}`
}
