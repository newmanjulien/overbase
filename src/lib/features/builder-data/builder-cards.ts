import {
	BriefcaseBusiness,
	Factory,
	Flag,
	LoaderCircle,
	Scale,
	ShieldCheck
} from 'lucide-svelte';
import type { Doc } from '$convex/_generated/dataModel';

type CategoryIcon = typeof Flag;

export const CUSTOM_NOTIFICATION_CARD_ID = 'custom-notification';

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
	artworkId: string;
	blueprintArtwork: {
		backColor: string;
		frontColor: string;
		iconId: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
	'briefcase-business': BriefcaseBusiness,
	factory: Factory,
	flag: Flag,
	'loader-circle': LoaderCircle,
	scale: Scale,
	'shield-check': ShieldCheck
};

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

export function toBuilderCardRecord(card: Doc<'builderCards'>): BuilderCardRecord {
	return {
		id: card.slug,
		categoryIds: card.categoryIds,
		title: card.title,
		description: card.description,
		artworkId: card.artworkId,
		blueprintArtwork: card.blueprintArtwork
	};
}
