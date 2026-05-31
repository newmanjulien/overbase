import { builderEntries } from './entries';
import type { BuilderGalleryEntry, BuilderRegistryEntry } from './types';
import { validateBuilderCatalog } from './validate-catalog';

const builderModeSortOrder = {
	'internal-data': 0,
	'public-data': 1
} satisfies Record<BuilderRegistryEntry['mode'], number>;

const builderRegistryValidationIssues = validateBuilderCatalog(builderEntries);

if (builderRegistryValidationIssues.length > 0) {
	throw new Error(
		`Invalid builder registry:\n${builderRegistryValidationIssues
			.map((issue) => `- ${issue.builderSlug ? `${issue.builderSlug}: ` : ''}${issue.message}`)
			.join('\n')}`
	);
}

export function listBuilders() {
	return [...builderEntries]
		.filter((builder) => builder.status === 'active')
		.sort(compareBuilderCatalogEntries);
}

function compareBuilderCatalogEntries(left: BuilderRegistryEntry, right: BuilderRegistryEntry) {
	return (
		builderModeSortOrder[left.mode] - builderModeSortOrder[right.mode] ||
		left.modeSortOrder - right.modeSortOrder
	);
}

export function listBuilderGalleryEntries(): BuilderGalleryEntry[] {
	return listBuilders()
		.filter((builder) => builder.showInGallery)
		.map(({ mode, slug, title, description, artwork }) => ({
			mode,
			slug,
			title,
			description,
			artwork
		}));
}

export function getBuilder(slug: string) {
	return (
		builderEntries.find((builder) => builder.slug === slug && builder.status === 'active') ?? null
	);
}
