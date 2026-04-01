import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		react(),
		dts({
			insertTypesEntry: true,
			tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
		}),
	],

	resolve: {
		alias: {
			// Esto mapea el alias de shadcn a la ruta real de tu proyecto
			'@': resolve(__dirname, './src'),
		},
	},

	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: '@mallhub/ui',
			formats: ['es', 'cjs'],
			fileName: (format) => `index.${format}.js`,
		},
		rollupOptions: {
			// Keep React external so the app and UI package share a single React instance.
			external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
		},

		commonjsOptions: {
			// Permite que Vite transforme módulos mixtos (ESM + CJS)
			transformMixedEsModules: true,
		},
	},
});
