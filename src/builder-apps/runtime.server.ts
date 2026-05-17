import { env } from '$env/dynamic/private';
import { customEmailBuilderManifest } from './custom-opportunity-format/definition';
import { CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG } from './ids';
import {
	getActiveBuilderAppPresentationEntry,
	listBuilderHomeCategories,
	mergeBuilderAppManifest,
	type BuilderAppRegistryEntry
} from './registry';
import { createExternalBuilderAppRuntime } from './runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(env);

function getCustomOpportunityFormatManifest() {
	const presentation = getActiveBuilderAppPresentationEntry(CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG);

	return presentation ? mergeBuilderAppManifest(customEmailBuilderManifest, presentation) : null;
}

function filterCategoriesForApps(apps: BuilderAppRegistryEntry[]) {
	const categoryIds = new Set(apps.flatMap((app) => app.categoryIds));

	return listBuilderHomeCategories().filter((category) => categoryIds.has(category.slug));
}

export async function getActiveBuilderAppManifest(slug: string) {
	if (slug === CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG) {
		return getCustomOpportunityFormatManifest();
	}

	return await externalRuntime.getActiveBuilderAppManifest(slug);
}

export async function listBuilderHomeApps() {
	const externalHome = await externalRuntime.listBuilderHomeApps();
	const customApp = getCustomOpportunityFormatManifest();
	const apps = [...externalHome.apps, ...(customApp ? [customApp] : [])].sort(
		(left, right) => left.sortOrder - right.sortOrder
	);

	return {
		categories: filterCategoriesForApps(apps),
		apps
	};
}

export async function listOnboardingBuilders() {
	const externalHome = await externalRuntime.listBuilderHomeApps();
	const apps = externalHome.apps.filter((app) => app.mode === 'guided');

	return {
		categories: filterCategoriesForApps(apps),
		apps
	};
}
