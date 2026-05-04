import {
	BriefcaseBusiness,
	Factory,
	Flag,
	LoaderCircle,
	Scale,
	ShieldCheck
} from 'lucide-svelte';
import type { BuilderCardArtworkId } from '$lib/features/builder-data/builder-card-artwork-presets';

type CardIcon = typeof Flag;

export type BuilderCardCategoryId = 'consulting' | 'insurance' | 'law' | 'manufacturing';
export type BuilderCardFilterId = BuilderCardCategoryId | 'all';

export type BuilderCardFilter = {
	id: BuilderCardFilterId;
	label: string;
	icon: CardIcon;
};

type BuilderCardDefinition = {
	id: string;
	categoryIds: readonly BuilderCardCategoryId[];
	title: string;
	description: string;
	artworkId: BuilderCardArtworkId;
};

export const BUILDER_CARD_FILTERS = [
	{
		id: 'all',
		label: 'All',
		icon: LoaderCircle
	},
	{
		id: 'consulting',
		label: 'Consulting',
		icon: BriefcaseBusiness
	},
	{
		id: 'insurance',
		label: 'Insurance',
		icon: ShieldCheck
	},
	{
		id: 'law',
		label: 'Law',
		icon: Scale
	},
	{
		id: 'manufacturing',
		label: 'Manufacturing',
		icon: Factory
	}
] as const satisfies readonly BuilderCardFilter[];

export const BUILDER_CARDS = [
	{
		id: 'bring-the-firm',
		categoryIds: ['consulting', 'law'],
		title: 'Bring the firm',
		description: 'Receive recommendations of colleagues to bring to meetings',
		artworkId: 'team-violet'
	},
	{
		id: 'whitespace-finder',
		categoryIds: ['insurance'],
		title: 'Whitespace finder',
		description: 'Receive a report 3 months before renewals with new policies each client could buy',
		artworkId: 'search-aqua'
	},
	{
		id: 'reasons-to-connect',
		categoryIds: ['law'],
		title: 'Reasons to connect',
		description: 'Receive an email when a client might have a legal issue they need your help with',
		artworkId: 'alert-coral'
	},
	{
		id: 'cross-selling',
		categoryIds: ['consulting', 'insurance', 'law', 'manufacturing'],
		title: 'Cross-selling',
		description: 'Receive an email when your partner has a client you could be selling to',
		artworkId: 'network-zinc'
	}
] as const satisfies readonly BuilderCardDefinition[];

export type BuilderCardId = (typeof BUILDER_CARDS)[number]['id'];
export type BuilderCardRecord = Omit<BuilderCardDefinition, 'id'> & {
	id: BuilderCardId;
};
