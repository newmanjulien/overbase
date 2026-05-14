import Briefcase from 'phosphor-svelte/lib/Briefcase';
import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
import Flag from 'phosphor-svelte/lib/Flag';
import Scales from 'phosphor-svelte/lib/Scales';
import { CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG } from '../../../../builder-apps/ids';
import type { BuilderAppRegistryEntry } from '../../../../builder-apps/registry';
import type { BuilderAppCategory } from '../../../../builder-apps/categories';
import { toBuilderArtworkPreset, type BuilderArtworkPreset } from './builder-artwork';
import type { PhosphorIcon } from '$lib/components/icons/types';

type CategoryIcon = PhosphorIcon;
type BuilderAppView = Pick<
	BuilderAppRegistryEntry,
	'slug' | 'categoryIds' | 'title' | 'description' | 'details' | 'mode' | 'artwork'
>;

export const CUSTOM_OPPORTUNITY_FORMAT_APP_ID = CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG;

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

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
	'briefcase-business': Briefcase,
	flag: Flag,
	scale: Scales
};

export const ALL_BUILDER_APP_FILTER = {
	id: 'all',
	label: 'All',
	iconId: 'loader-circle',
	icon: CircleNotch,
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
		details: {
			paragraphs: [...app.details.paragraphs]
		},
		mode: app.mode,
		artwork: toBuilderArtworkPreset(app.artwork)
	};
}
