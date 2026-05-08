import { BriefcaseBusiness, Flag, LoaderCircle, Scale } from 'lucide-svelte';
import { CUSTOM_NOTIFICATION_APP_SLUG } from '../../../../builder-apps/ids';
import type { BuilderAppRegistryEntry } from '../../../../builder-apps/registry';
import type { BuilderAppCategory } from '../../../../builder-apps/categories';
import type { BuilderAppArtwork } from '../../../../builder-apps/presentation';
import { toBuilderArtworkPreset, type BuilderArtworkPreset } from './builder-artwork';

type CategoryIcon = typeof Flag;
type BuilderAppView = {
	slug: string;
	categoryIds: readonly string[];
	title: string;
	description: string;
	mode: 'custom' | 'guided';
	artwork: BuilderAppArtwork;
};

export const CUSTOM_NOTIFICATION_APP_ID = CUSTOM_NOTIFICATION_APP_SLUG;

export type BuilderAppCategoryId = string;
export type BuilderAppFilterId = BuilderAppCategoryId | 'all';

export type BuilderAppFilter = {
	id: BuilderAppFilterId;
	label: string;
	iconId: string;
	icon: CategoryIcon;
	sortOrder: number;
};

export type BuilderAppRecord = {
	id: string;
	categoryIds: string[];
	title: string;
	description: string;
	mode: 'custom' | 'guided';
	artwork: BuilderArtworkPreset;
};

export type BuilderAppHomeData = {
	categories: BuilderAppCategory[];
	apps: BuilderAppRegistryEntry[];
};

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
	'briefcase-business': BriefcaseBusiness,
	flag: Flag,
	scale: Scale
};

export const ALL_BUILDER_APP_FILTER = {
	id: 'all',
	label: 'All',
	iconId: 'loader-circle',
	icon: LoaderCircle,
	sortOrder: -1
} satisfies BuilderAppFilter;

function getCategoryIcon(iconId: string) {
	return CATEGORY_ICONS[iconId] ?? Flag;
}

export function toBuilderAppFilter(category: BuilderAppCategory): BuilderAppFilter {
	return {
		id: category.slug,
		label: category.label,
		iconId: category.iconId,
		icon: getCategoryIcon(category.iconId),
		sortOrder: category.sortOrder
	};
}

export function toBuilderAppRecord(app: BuilderAppView): BuilderAppRecord {
	return {
		id: app.slug,
		categoryIds: [...app.categoryIds],
		title: app.title,
		description: app.description,
		mode: app.mode,
		artwork: toBuilderArtworkPreset(app.artwork)
	};
}
