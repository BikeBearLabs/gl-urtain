import onlyWarn from 'eslint-plugin-only-warn';
import prettier from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import xoTypeScript from 'eslint-config-xo-typescript';
import globals from 'globals';
import eslint from '@eslint/js';
/** @import {Linter} from 'eslint' */

const config = /** @type {const} @satisfies {Linter.Config[]} */ ([
	eslint.configs.recommended,
	.../** @type {Linter.Config[]} */ (tseslint.configs.recommendedTypeChecked),
	{
		plugins: {
			'only-warn': onlyWarn,
		},

		languageOptions: {
			globals: {
				...Object.fromEntries(
					Object.entries(globals.node).map(([key]) => [key, 'off']),
				),
				...globals.browser,
			},
		},
	},
	...xoTypeScript.map((/** @type {Linter.Config} */ config) => {
		if (config.rules) {
			for (const [k] of Object.entries(config.rules)) {
				if (k.startsWith('@stylistic')) {
					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					delete config.rules[k];
				}
			}
		}

		return { ...config };
	}),
	prettier,
	{
		rules: {
			'no-console': 'error',
			'dot-notation': 'off',
			'@typescript-eslint/dot-notation': 'error',
			'@typescript-eslint/consistent-type-assertions': 'off',
			'no-labels': 'off',
			'no-unused-labels': 'off',
			'no-extra-label': 'off',
			'no-unused-vars': 'off',
			'no-eq-null': 'off',
			curly: 'error',

			eqeqeq: [
				'error',
				'always',
				{
					null: 'ignore',
				},
			],

			'@typescript-eslint/class-literal-property-style': [
				'error',
				'fields',
			],
			'no-await-in-loop': 'off',
			'new-cap': 'off',

			'@typescript-eslint/array-type': [
				'error',
				{
					default: 'array',
				},
			],

			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: [
						'variable',
						'classProperty',
						'accessor',
						'objectLiteralProperty',
					],
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',

					filter: {
						regex: '(^\\d)|[^\\w$]|^$',
						match: false,
					},
				},
				{
					selector: ['function'],
					format: ['camelCase', 'PascalCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',

					filter: {
						regex: '(^\\d)|[^\\w$]|^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$',
						match: false,
					},
				},
				{
					selector: [
						'parameterProperty',
						'classMethod',
						'objectLiteralMethod',
						'typeMethod',
					],
					format: ['camelCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid',

					filter: {
						regex: '(^\\d)|[^\\w$]',
						match: false,
					},
				},
				{
					selector: 'typeLike',
					format: ['PascalCase'],
				},
				{
					selector: 'interface',
					filter: '^(?!I)[A-Z]',
					format: ['PascalCase'],
				},
				{
					selector: 'typeParameter',
					filter: '^T$|^[A-Z][a-zA-Z]+$',
					format: ['PascalCase'],
				},
				{
					selector: 'typeAlias',
					filter: '^(?!T)[A-Z]',
					format: ['PascalCase'],
				},
				{
					selector: ['classProperty', 'objectLiteralProperty'],
					format: null,
					modifiers: ['requiresQuotes'],
				},
			],

			'capitalized-comments': 'off',
			'@typescript-eslint/no-redeclare': 'off',
			'no-empty-pattern': 'off',
			'func-names': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/unified-signatures': 'off',
			'no-return-assign': 'off',
			'@typescript-eslint/member-ordering': 'off',
			'object-shorthand': ['error', 'properties'],
		},
	},
]);

export default config;
