import { APP_LINKS } from '$lib/app/app-links';
import { getActiveBuilderCatalogEntry } from '../../../../../builders/catalog.server';
import type { PageServerLoad } from './$types';

const BUILDER_UNAVAILABLE_PAGE_DATA = {
	app: null,
	guide: null,
	headerTitle: 'Builder unavailable',
	headerTitleEditable: false,
	chromeMode: 'focused'
} satisfies App.PageData & {
	app: null;
	guide: null;
};

export const load: PageServerLoad = async ({ params }) => {
	const app = await getActiveBuilderCatalogEntry(params.appSlug);

	if (!app) {
		return BUILDER_UNAVAILABLE_PAGE_DATA;
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
		desktopBreadcrumbParent: {
			label: 'Email format builder',
			href: APP_LINKS.builders.pathname
		}
	};
};
