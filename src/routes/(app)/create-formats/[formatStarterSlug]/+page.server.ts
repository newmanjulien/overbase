import { APP_LINKS } from '$lib/app/app-links';
import { getFormatStarter } from '$lib/features/format-starters/catalog';
import { getEmailFormatDefinition } from '$domain/email-formats';
import type { PageServerLoad } from './$types';

const FORMAT_STARTER_UNAVAILABLE_PAGE_DATA = {
	formatStarter: null,
	headerTitle: 'Format unavailable',
	headerTitleEditable: false,
	chromeMode: 'focused'
} satisfies App.PageData & {
	formatStarter: null;
};

export const load: PageServerLoad = async ({ params }) => {
	const formatStarter = getFormatStarter(params.formatStarterSlug);
	const formatDefinition = formatStarter
		? getEmailFormatDefinition(formatStarter.formatDefinitionSlug)
		: null;

	if (!formatStarter || !formatDefinition) {
		return FORMAT_STARTER_UNAVAILABLE_PAGE_DATA;
	}

	return {
		formatStarter,
		headerTitle: formatStarter.defaultPresentation.title,
		headerTitleEditable: formatDefinition.contentEditPolicy.title,
		chromeMode: 'focused',
		desktopBreadcrumbParent: {
			label: 'Create formats',
			href: APP_LINKS.createFormats.pathname
		}
	};
};
