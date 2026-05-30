import { builderCategories } from '../builders/categories';
import type { BuilderAppManifest } from '@overbase/builder-sdk/app-protocol';
import type { GuideDefinition } from '@overbase/builder-sdk/catalog';
import {
	builderAppPresentationEntries,
	type BuilderAppPresentation
} from './presentation';

export { BRING_THE_FIRM_BUILDER_APP_SLUG, CUSTOM_BUILDER_APP_SLUG } from './ids';

export type BuilderAppRegistryEntry = BuilderAppManifest & BuilderAppPresentation;

export type BuilderAppGuideEntry = GuideDefinition & {
	appSlug: string;
};

export function getBuilderAppPresentationEntry(slug: string) {
	return builderAppPresentationEntries.find((presentation) => presentation.slug === slug) ?? null;
}

export function getActiveBuilderAppPresentationEntry(slug: string) {
	const presentation = getBuilderAppPresentationEntry(slug);

	return presentation?.status === 'active' ? presentation : null;
}

export function mergeBuilderAppManifest(
	manifest: BuilderAppManifest,
	presentation: BuilderAppPresentation
): BuilderAppRegistryEntry {
	if (manifest.slug !== presentation.slug) {
		throw new Error('Builder app manifest and presentation slugs do not match.');
	}

	return {
		...manifest,
		...presentation
	};
}

export function listBuilderHomeCategories() {
	return [...builderCategories].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function listActiveBuilderAppPresentationEntries() {
	return builderAppPresentationEntries
		.filter((app) => app.status === 'active')
		.sort((left, right) => left.sortOrder - right.sortOrder);
}

export function listBuilderHomePresentationEntries() {
	return listActiveBuilderAppPresentationEntries().filter((app) => app.showInGallery);
}
