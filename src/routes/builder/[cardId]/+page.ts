import { env } from '$env/dynamic/public';
import { api } from '$convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const convexUrl = env.PUBLIC_CONVEX_URL;

	if (!convexUrl) {
		error(503, 'PUBLIC_CONVEX_URL is required to load builder templates.');
	}

	const convex = new ConvexHttpClient(convexUrl);
	const template = await convex.query(api.builder.getActiveBuilderCardBySlug, {
		slug: params.cardId
	});
	const card = template?.card ?? null;

	return {
		card,
		guide: template?.guide ?? null,
		headerTitle: card?.title ?? 'Notification builder',
		headerTitleEditable: Boolean(card)
	};
};
