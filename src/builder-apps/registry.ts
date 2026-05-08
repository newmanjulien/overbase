import { bringTheFirmCatalog } from '../external/bring-the-firm/catalog';
import { crossSellingCatalog } from '../external/cross-selling/catalog';
import { customEmailBuilderCatalog } from '../external/custom/definition';
import { reasonsToConnectCatalog } from '../external/reasons-to-connect/catalog';
import { whitespaceFinderCatalog } from '../external/whitespace-finder/catalog';
import { builderAppCategories } from './categories';
import type { BuilderAppManifest } from '@overbase/builder-sdk/app-protocol';
import type { GuideDefinition } from '@overbase/builder-sdk/catalog';

export const emailBuilderAppManifests = [
	bringTheFirmCatalog,
	whitespaceFinderCatalog,
	reasonsToConnectCatalog,
	crossSellingCatalog
] satisfies BuilderAppManifest[];

export const builderAppManifests = [
	...emailBuilderAppManifests,
	customEmailBuilderCatalog
] satisfies BuilderAppManifest[];

export type BuilderAppGuideEntry = GuideDefinition & {
	appSlug: string;
};

export const builderAppGuides = builderAppManifests.flatMap((app): BuilderAppGuideEntry[] =>
	app.guide
		? [
				{
					appSlug: app.slug,
					...app.guide
				}
			]
		: []
);

export function getActiveBuilderAppManifest(slug: string) {
	return builderAppManifests.find((app) => app.slug === slug && app.status === 'active') ?? null;
}

export function getBuilderAppGuide(slug: string) {
	return builderAppGuides.find((guide) => guide.appSlug === slug) ?? null;
}

export function listBuilderHomeApps() {
	const categories = [...builderAppCategories].sort(
		(left, right) => left.sortOrder - right.sortOrder
	);
	const apps = builderAppManifests
		.filter((app) => app.showInGallery && app.status === 'active')
		.sort((left, right) => left.sortOrder - right.sortOrder);

	return { categories, apps };
}
