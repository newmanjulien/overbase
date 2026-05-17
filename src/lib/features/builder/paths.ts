export const BUILDER_FRESH_START_ROUTE = '/builders/[appSlug]?fresh=1' as const;

export function builderAppSlugParams(appSlug: string) {
	return { appSlug };
}
