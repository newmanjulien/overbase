export const BUILDER_FRESH_START_ROUTE = '/builder/[appSlug]?fresh=1' as const;

export function builderAppSlugParams(appSlug: string) {
	return { appSlug };
}
