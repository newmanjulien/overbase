import { env } from '$env/dynamic/public';
import { api } from '$convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const convexUrl = env.PUBLIC_CONVEX_URL;

	if (!convexUrl) {
		error(503, 'PUBLIC_CONVEX_URL is required to load builder apps.');
	}

	const convex = new ConvexHttpClient(convexUrl);
	const appResult = await convex.query(api.builder.getActiveBuilderAppBySlug, {
		slug: params.appSlug
	});
	const app = appResult?.app ?? null;

	return {
		app,
		guide: appResult?.guide ?? null,
		headerTitle: app?.title ?? 'Notification builder',
		headerTitleEditable: Boolean(app)
	};
};
