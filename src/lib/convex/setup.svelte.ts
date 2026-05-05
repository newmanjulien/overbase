import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { setupConvex } from 'convex-svelte';

const CONVEX_URL_ENV_VAR = 'PUBLIC_CONVEX_URL';

export function setupAppConvex() {
	const convexUrl = env.PUBLIC_CONVEX_URL;

	if (!convexUrl) {
		if (browser && dev) {
			console.warn(
				`Convex is disabled because ${CONVEX_URL_ENV_VAR} is not set. Run npx convex dev to configure it.`
			);
		}

		return;
	}

	setupConvex(convexUrl);
}
