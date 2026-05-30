import { APP_LINKS } from '$lib/app/app-links';
import { getBlueprint } from '../../../../../blueprints/registry';
import type { PageServerLoad } from './$types';

const BLUEPRINT_UNAVAILABLE_PAGE_DATA = {
	blueprint: null,
	headerTitle: 'Blueprint unavailable',
	headerTitleEditable: false,
	chromeMode: 'focused'
} satisfies App.PageData & {
	blueprint: null;
};

export const load: PageServerLoad = async ({ params }) => {
	const blueprint = getBlueprint(params.blueprintSlug);

	if (!blueprint) {
		return BLUEPRINT_UNAVAILABLE_PAGE_DATA;
	}

	return {
		blueprint,
		headerTitle: blueprint.title,
		headerTitleEditable: true,
		chromeMode: 'focused',
		desktopBreadcrumbParent: {
			label: 'Blueprints',
			href: APP_LINKS.blueprints.pathname
		}
	};
};
