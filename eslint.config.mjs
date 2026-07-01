import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const config = await generateEslintConfig({
	enableTypescript: true,
	ignores: ['.test-dist/**'],
})

export default [
	...config,
	{
		files: ['tests/**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.test.json',
			},
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'off',
		},
	},
]
