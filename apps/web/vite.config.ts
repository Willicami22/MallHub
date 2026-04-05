import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), reactRouter()],
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
