import {
	getActiveBuilderAppManifest,
	listBuilderHomeApps as listExternalBuilderHomeApps
} from '../builder-apps/runtime.server';
import { listActiveBuilderAppPresentationEntries } from '../builder-apps/registry';
import { builderCategories } from './categories';
import type { BuilderCatalogEntry, BuilderCatalogHomeData } from './catalog';

function toExternalCatalogEntry(app: Awaited<ReturnType<typeof getActiveBuilderAppManifest>>) {
	return app ? ({ ...app, kind: 'externalApp' } as const) : null;
}

function filterCategoriesForEntries(entries: BuilderCatalogEntry[]) {
	const categoryIds = new Set(entries.flatMap((entry) => entry.categoryIds));

	return [...builderCategories]
		.sort((left, right) => left.sortOrder - right.sortOrder)
		.filter((category) => categoryIds.has(category.slug));
}

function assertUniqueBuilderSlugs(entries: readonly { slug: string }[]) {
	const seenSlugs = new Set<string>();

	for (const entry of entries) {
		if (seenSlugs.has(entry.slug)) {
			throw new Error(`Duplicate builder slug registered: ${entry.slug}`);
		}

		seenSlugs.add(entry.slug);
	}
}

export async function getActiveBuilderCatalogEntry(slug: string) {
	assertUniqueBuilderSlugs(listActiveBuilderAppPresentationEntries());

	try {
		return toExternalCatalogEntry(await getActiveBuilderAppManifest(slug));
	} catch {
		return null;
	}
}

export async function listBuilderCatalogHome(): Promise<BuilderCatalogHomeData> {
	const externalHome = await listExternalBuilderHomeApps();
	const apps = externalHome.apps
		.map((app) => ({ ...app, kind: 'externalApp' }) as const)
		.sort((left, right) => left.sortOrder - right.sortOrder);
	assertUniqueBuilderSlugs(apps);

	return {
		categories: filterCategoriesForEntries(apps),
		apps
	};
}
