import { CUSTOM_BUILDER_APP_SLUG } from '../../../../builder-apps/ids';
import type { BuilderAppRegistryEntry } from '../../../../builder-apps/registry';
import type { BuilderAppCategory } from '../../../../builder-apps/categories';
import { toBuilderArtworkPreset, type BuilderArtworkPreset } from './builder-artwork';

type BuilderAppView = Pick<
	BuilderAppRegistryEntry,
	'slug' | 'categoryIds' | 'title' | 'description' | 'details' | 'mode' | 'artwork'
>;

export const CUSTOM_BUILDER_APP_ID = CUSTOM_BUILDER_APP_SLUG;

export type BuilderAppCategoryId = string;
export type BuilderAppFilterId = BuilderAppCategoryId | 'all';

export type BuilderAppRecord = {
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

export type BuilderAppHomeData = {
	categories: BuilderAppCategory[];
	apps: BuilderAppRegistryEntry[];
};

export function toBuilderAppRecord(app: BuilderAppView): BuilderAppRecord {
	return {
		id: app.slug,
		categoryIds: [...app.categoryIds],
		title: app.title,
		description: app.description,
		details: {
			paragraphs: [...app.details.paragraphs]
		},
		mode: app.mode,
		artwork: toBuilderArtworkPreset(app.artwork)
	};
}
