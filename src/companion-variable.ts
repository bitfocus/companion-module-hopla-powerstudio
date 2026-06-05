export const DEFAULT_MODULE_VARIABLE_PREFIX = 'hopla-power-studio'

type ModuleVariableOwner = {
	label?: string
}

export function moduleVariablePrefix(owner: ModuleVariableOwner): string {
	return owner.label?.trim() || DEFAULT_MODULE_VARIABLE_PREFIX
}

export function moduleVariableReference(owner: ModuleVariableOwner, variable: string): string {
	return `$(${moduleVariablePrefix(owner)}:${variable})`
}

export function optionalModuleVariableLines(
	owner: ModuleVariableOwner,
	baseText: string,
	showVariables: boolean,
	variables: string[],
): string {
	if (!showVariables) {
		return baseText
	}

	return [baseText, ...variables.map((variable) => moduleVariableReference(owner, variable))].join('\\n')
}
