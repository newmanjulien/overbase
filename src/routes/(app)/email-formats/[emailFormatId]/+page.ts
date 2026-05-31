import { APP_LINKS } from '$lib/app/app-links';

export function load() {
	return {
		headerTitle: 'Email format',
		headerTitleEditable: false,
		desktopBreadcrumbParent: {
			label: 'My email formats',
			href: APP_LINKS.emailFormats.pathname
		},
		chromeMode: 'focused'
	};
}
