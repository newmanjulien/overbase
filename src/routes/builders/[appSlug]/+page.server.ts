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
				headerTitle: 'Format builder',
				headerTitleEditable: false,
				chromeMode: 'focused'
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
			headerTitleEditable: true,
			chromeMode: 'focused',
			headerParent: {
				label: 'Format builder',
				href: '/builders'
			}
		};
	} catch (loadError) {
		error(503, loadError instanceof Error ? loadError.message : 'Builder app unavailable.');
	}
};
