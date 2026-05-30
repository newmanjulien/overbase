import type { APP_LINKS } from '$lib/app/app-links';

export type BreadcrumbParentHref =
	| typeof APP_LINKS.builders.pathname
	| typeof APP_LINKS.blueprints.pathname
	| typeof APP_LINKS.emailFormats.pathname;

export type BreadcrumbParent = {
	label: string;
	href: BreadcrumbParentHref;
};
