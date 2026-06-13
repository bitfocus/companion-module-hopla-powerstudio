import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const buildUtilPath = path.join(
	scriptDir,
	'..',
	'node_modules',
	'@companion-module',
	'tools',
	'dist',
	'scripts',
	'lib',
	'build-util.js',
)

if (!fs.existsSync(buildUtilPath)) {
	console.warn('Skipping @companion-module/tools patch: build-util.js was not found')
} else {
	let source = fs.readFileSync(buildUtilPath, 'utf8')

	if (!source.includes("import { fileURLToPath } from 'url';") || !source.includes("cwd.startsWith('file:')")) {
		const importBefore = "import { createRequire } from 'module';\n"
		const importAfter = "import { createRequire } from 'module';\nimport { fileURLToPath } from 'url';\n"
		const functionBefore = 'export async function findModuleDir(cwd) {\n    const stat = await fs.stat(cwd);\n'
		const functionAfter =
			"export async function findModuleDir(cwd) {\n    if (cwd.startsWith('file:')) {\n        cwd = fileURLToPath(cwd);\n    }\n    const stat = await fs.stat(cwd);\n"

		if (!source.includes(importBefore) || !source.includes(functionBefore)) {
			console.warn('Skipping @companion-module/tools patch: expected source pattern was not found')
		} else {
			source = source.replace(importBefore, importAfter).replace(functionBefore, functionAfter)

			fs.writeFileSync(buildUtilPath, source)
			console.log('Applied @companion-module/tools Windows file URL patch')
		}
	}
}
