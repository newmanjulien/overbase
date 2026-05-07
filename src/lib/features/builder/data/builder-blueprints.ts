import {
	BriefcaseBusiness,
	Factory,
	Flag,
	LoaderCircle,
	Scale,
	ShieldCheck
} from 'lucide-svelte';
import { CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID } from '$lib/features/builder/domain/email-design';
import { toBuilderArtworkPreset, type BuilderArtworkPreset } from './builder-artwork';
import type {
	NotificationArtworkPreset,
	NotificationCategory
} from '../../../../external/blueprints/content';

type CategoryIcon = typeof Flag;
type BuilderBlueprintView = {
	slug: string;
	categoryIds: string[];
	title: string;
	description: string;
	mode: 'custom' | 'guided';
	artwork: NotificationArtworkPreset;
};

export const CUSTOM_NOTIFICATION_BLUEPRINT_ID = CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID;

export type BuilderBlueprintCategoryId = string;
export type BuilderBlueprintFilterId = BuilderBlueprintCategoryId | 'all';

export type BuilderBlueprintFilter = {
	id: BuilderBlueprintFilterId;
	label: string;
	iconId: string;
	icon: CategoryIcon;
	sortOrder: number;
};

export type BuilderBlueprintRecord = {
	id: string;
	categoryIds: string[];
	title: string;
	description: string;
	mode: 'custom' | 'guided';
	artwork: BuilderArtworkPreset;
};

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
	'briefcase-business': BriefcaseBusiness,
	factory: Factory,
	flag: Flag,
	scale: Scale,
	'shield-check': ShieldCheck
};

export const ALL_BUILDER_BLUEPRINT_FILTER = {
	id: 'all',
	label: 'All',
	iconId: 'loader-circle',
	icon: LoaderCircle,
	sortOrder: -1
} satisfies BuilderBlueprintFilter;

function getCategoryIcon(iconId: string) {
	return CATEGORY_ICONS[iconId] ?? Flag;
}

export function toBuilderBlueprintFilter(category: NotificationCategory): BuilderBlueprintFilter {
	return {
		id: category.slug,
		label: category.label,
		iconId: category.iconId,
		icon: getCategoryIcon(category.iconId),
		sortOrder: category.sortOrder
	};
}

export function toBuilderBlueprintRecord(blueprint: BuilderBlueprintView): BuilderBlueprintRecord {
	return {
		id: blueprint.slug,
		categoryIds: blueprint.categoryIds,
		title: blueprint.title,
		description: blueprint.description,
		mode: blueprint.mode,
		artwork: toBuilderArtworkPreset(blueprint.artwork)
	};
}
