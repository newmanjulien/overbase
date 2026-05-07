import { bringTheFirmCatalog } from '../../../../external/bring-the-firm/catalog';
import { crossSellingCatalog } from '../../../../external/cross-selling/catalog';
import { customEmailBuilderCatalog } from '../../../../external/custom/definition';
import { externalCategories } from './categories';
import { reasonsToConnectCatalog } from '../../../../external/reasons-to-connect/catalog';
import type {
	ExternalAppCatalogDefinition,
	ExternalGuideDefinition
} from './types';
import { whitespaceFinderCatalog } from '../../../../external/whitespace-finder/catalog';

export const emailExternalAppCatalog = [
	bringTheFirmCatalog,
	whitespaceFinderCatalog,
	reasonsToConnectCatalog,
	crossSellingCatalog
] satisfies ExternalAppCatalogDefinition[];

export const externalAppCatalog = [
	...emailExternalAppCatalog,
	customEmailBuilderCatalog
] satisfies ExternalAppCatalogDefinition[];

export type ExternalAppGuideEntry = ExternalGuideDefinition & {
	appSlug: string;
};

export const externalAppGuides = externalAppCatalog.flatMap((app): ExternalAppGuideEntry[] =>
	app.guide
		? [
				{
					appSlug: app.slug,
					...app.guide
				}
			]
		: []
);

export function getActiveExternalApp(slug: string) {
	return externalAppCatalog.find((app) => app.slug === slug && app.status === 'active') ?? null;
}

export function getExternalAppGuide(slug: string) {
	return externalAppGuides.find((guide) => guide.appSlug === slug) ?? null;
}

export function listBuilderHomeExternalApps() {
	const categories = [...externalCategories].sort((left, right) => left.sortOrder - right.sortOrder);
	const apps = externalAppCatalog
		.filter((app) => app.showInGallery && app.status === 'active')
		.sort((left, right) => left.sortOrder - right.sortOrder);

	return { categories, apps };
}
