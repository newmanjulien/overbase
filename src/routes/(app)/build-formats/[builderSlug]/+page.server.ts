import { APP_LINKS } from '$lib/app/app-links';
import { getBuilder } from '../../../../builders/registry';
import type { PageServerLoad } from './$types';

const BUILDER_UNAVAILABLE_PAGE_DATA = {
	builder: null,
	headerTitle: 'Format unavailable',
	headerTitleEditable: false,
	chromeMode: 'focused'
} satisfies App.PageData & {
	builder: null;
};

export const load: PageServerLoad = async ({ params }) => {
	const builder = getBuilder(params.builderSlug);

	if (!builder) {
		return BUILDER_UNAVAILABLE_PAGE_DATA;
	}

	return {
		builder,
		headerTitle: builder.title,
		headerTitleEditable: true,
		chromeMode: 'focused',
		desktopBreadcrumbParent: {
			label: 'Build formats',
			href: APP_LINKS.buildFormats.pathname
		}
	};
};
