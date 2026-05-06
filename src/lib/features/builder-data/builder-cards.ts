import {
	BriefcaseBusiness,
	Factory,
	Flag,
	LoaderCircle,
	Scale,
	ShieldCheck
} from 'lucide-svelte';
import { CUSTOM_EMAIL_BUILDER_CARD_ID } from '$lib/builder-domain/email';
import type { Doc } from '$convex/_generated/dataModel';
import { toBuilderArtworkPreset, type BuilderArtworkPreset } from './builder-artwork';

type CategoryIcon = typeof Flag;
type BuilderCardView = {
	slug: string;
	categoryIds: string[];
	title: string;
	description: string;
	artwork: Doc<'builderArtworkPresets'>;
};

export const CUSTOM_NOTIFICATION_CARD_ID = CUSTOM_EMAIL_BUILDER_CARD_ID;

export type BuilderCardCategoryId = string;
export type BuilderCardFilterId = BuilderCardCategoryId | 'all';

export type BuilderCardFilter = {
	id: BuilderCardFilterId;
	label: string;
	iconId: string;
	icon: CategoryIcon;
	sortOrder: number;
};

export type BuilderCardRecord = {
	id: string;
	categoryIds: string[];
	title: string;
	description: string;
	artwork: BuilderArtworkPreset;
};

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
	'briefcase-business': BriefcaseBusiness,
	factory: Factory,
	flag: Flag,
	scale: Scale,
	'shield-check': ShieldCheck
};

export const ALL_BUILDER_CARD_FILTER = {
	id: 'all',
	label: 'All',
	iconId: 'loader-circle',
	icon: LoaderCircle,
	sortOrder: -1
} satisfies BuilderCardFilter;

function getCategoryIcon(iconId: string) {
	return CATEGORY_ICONS[iconId] ?? Flag;
}

export function toBuilderCardFilter(category: Doc<'builderCategories'>): BuilderCardFilter {
	return {
		id: category.slug,
		label: category.label,
		iconId: category.iconId,
		icon: getCategoryIcon(category.iconId),
		sortOrder: category.sortOrder
	};
}

export function toBuilderCardRecord(card: BuilderCardView): BuilderCardRecord {
	return {
		id: card.slug,
		categoryIds: card.categoryIds,
		title: card.title,
		description: card.description,
		artwork: toBuilderArtworkPreset(card.artwork)
	};
}
