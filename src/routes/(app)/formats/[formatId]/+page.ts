import { APP_LINKS } from '$lib/app/app-links';

export function load() {
	return {
		headerTitle: 'Format',
		headerTitleEditable: true,
		desktopBreadcrumbParent: {
			label: 'My formats',
			href: APP_LINKS.formats.pathname
		},
		chromeMode: 'focused'
	};
}
