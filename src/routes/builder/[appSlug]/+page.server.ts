import { error } from '@sveltejs/kit';
import { getActiveBuilderAppManifest } from '../../../builder-apps/runtime.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const app = await getActiveBuilderAppManifest(params.appSlug);

		if (!app) {
			return {
				app: null,
				guide: null,
				headerTitle: 'Notification builder',
				headerTitleEditable: false
			};
		}

		return {
			app,
			guide: app.guide
				? {
						appSlug: app.slug,
						...app.guide
					}
				: null,
			headerTitle: app.title,
			headerTitleEditable: true
		};
	} catch (loadError) {
		error(503, loadError instanceof Error ? loadError.message : 'Builder app unavailable.');
	}
};
