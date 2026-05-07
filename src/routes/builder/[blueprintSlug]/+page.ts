import { env } from '$env/dynamic/public';
import { api } from '$convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const convexUrl = env.PUBLIC_CONVEX_URL;

	if (!convexUrl) {
		error(503, 'PUBLIC_CONVEX_URL is required to load builder blueprints.');
	}

	const convex = new ConvexHttpClient(convexUrl);
	const blueprintResult = await convex.query(api.builder.getActiveBuilderBlueprintBySlug, {
		slug: params.blueprintSlug
	});
	const blueprint = blueprintResult?.blueprint ?? null;

	return {
		blueprint,
		guide: blueprintResult?.guide ?? null,
		headerTitle: blueprint?.title ?? 'Notification builder',
		headerTitleEditable: Boolean(blueprint)
	};
};
