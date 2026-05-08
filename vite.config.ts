import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	for (const [key, value] of Object.entries(env)) {
		process.env[key] ??= value;
	}

	return {
		plugins: [tailwindcss(), sveltekit()]
	};
});
