import { env } from '$env/dynamic/private';
import { listBuilderHomeCategories, type BuilderAppRegistryEntry } from './registry';
import { createExternalBuilderAppRuntime } from './runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(env);

function filterCategoriesForApps(apps: BuilderAppRegistryEntry[]) {
	const categoryIds = new Set(apps.flatMap((app) => app.categoryIds));

	return listBuilderHomeCategories().filter((category) => categoryIds.has(category.slug));
}

export async function getActiveBuilderAppManifest(slug: string) {
	return await externalRuntime.getActiveBuilderAppManifest(slug);
}

export async function listBuilderHomeApps() {
	return await externalRuntime.listBuilderHomeApps();
}

export async function listOnboardingBuilders() {
	const externalHome = await externalRuntime.listBuilderHomeApps();
	const apps = externalHome.apps.filter((app) => app.mode === 'guided');

	return {
		categories: filterCategoriesForApps(apps),
		apps
	};
}
