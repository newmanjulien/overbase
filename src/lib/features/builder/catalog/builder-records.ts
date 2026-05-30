import type { BuilderCategory } from '../../../../builders/categories';
import type { BuilderCatalogEntry } from '../../../../builders/catalog';
import { toBuilderArtworkPreset, type BuilderArtworkPreset } from './builder-artwork';

type BuilderCatalogView = Pick<
	BuilderCatalogEntry,
	'kind' | 'slug' | 'categoryIds' | 'title' | 'description' | 'details' | 'mode' | 'artwork'
>;

export type BuilderCategoryId = string;
export type BuilderCatalogFilterId = BuilderCategoryId | 'all';

export type BuilderCatalogRecord = {
	kind: 'externalApp';
	id: string;
	categoryIds: string[];
	title: string;
	description: string;
	details: {
		paragraphs: string[];
	};
	mode: 'custom' | 'guided';
	artwork: BuilderArtworkPreset;
};

export type BuilderCatalogHomeData = {
	categories: BuilderCategory[];
	apps: BuilderCatalogEntry[];
};

export function toBuilderCatalogRecord(builder: BuilderCatalogView): BuilderCatalogRecord {
	return {
		kind: builder.kind,
		id: builder.slug,
		categoryIds: [...builder.categoryIds],
		title: builder.title,
		description: builder.description,
		details: {
			paragraphs: [...builder.details.paragraphs]
		},
		mode: builder.mode,
		artwork: toBuilderArtworkPreset(builder.artwork)
	};
}
