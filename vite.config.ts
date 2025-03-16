import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import glsl from 'vite-plugin-glsl';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => ({
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['umd'],
			name: pkg.name,
		},
		sourcemap: true,
		rollupOptions: {
			input: {
				index: 'src/index.ts',
				...(mode === 'development' && { 'index.html': 'index.html' }),
			},
			output: {
				entryFileNames: ({ name }) => `${name}.js`,
				format: 'umd',
				inlineDynamicImports: false,
			},
		},
	},
	plugins: [
		tsconfigPaths(),
		glsl({
			compress: true,
		}),
		dts({
			entryRoot: 'src',
			rollupTypes: true,
		}),
	],
}));
