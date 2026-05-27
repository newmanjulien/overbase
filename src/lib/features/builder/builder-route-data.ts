import { APP_LINKS } from '$lib/app/app-links';

export const BUILDER_VIEWPORT_REQUIREMENT = {
	minWidth: 'desktop',
	fallbackHref: APP_LINKS.emailFormats.pathname
} satisfies NonNullable<App.PageData['viewportRequirement']>;
