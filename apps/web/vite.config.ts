import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: '../../project.inlang',
			outdir: './app/paraglide',
			strategy: ['url', 'baseLocale'],
		}),
		tailwindcss(),
		reactRouter(),
	],
	resolve: {
		tsconfigPaths: true,
	},
	ssr: {
		noExternal: ['@mallhub/ui'],
	},
	optimizeDeps: {
		// También asegúrate de incluirlo en la optimización del cliente
		include: ['@mallhub/ui'],
	},
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
		},
	},
});
