import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const config = await generateEslintConfig({
	enableTypescript: true,
	ignores: ['.test-dist/**'],
})

export default [
	...config,
	{
		files: ['tests/**/*.ts'],
		rules: {
			'@typescript-eslint/no-floating-promises': 'off',
		},
	},
]
