export const BUILDER_FRESH_START_ROUTE = '/builders/[appSlug]?fresh=1' as const;
export const BUILDER_VIEWPORT_REQUIREMENT = {
	minWidth: 'desktop',
	fallbackHref: '/formats'
} satisfies NonNullable<App.PageData['viewportRequirement']>;

export function builderAppSlugParams(appSlug: string) {
	return { appSlug };
}
