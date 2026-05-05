import { BellRing, Network, ScanSearch, Sparkles, UsersRound } from 'lucide-svelte';
import type { BuilderCardId } from '$lib/features/builder-data/builder-cards';

export type BuilderBlueprintArtworkIcon = typeof UsersRound;

export type BuilderBlueprintArtworkPreset = {
	backColor: string;
	frontColor: string;
	icon: BuilderBlueprintArtworkIcon;
	iconCenterX: string;
	iconCenterY: string;
};

const DEFAULT_BLUEPRINT_ARTWORK_PRESET = {
	backColor: '#9DE5F3',
	frontColor: '#DFA0F4',
	icon: UsersRound,
	iconCenterX: '60%',
	iconCenterY: '46%'
} satisfies BuilderBlueprintArtworkPreset;

export const BUILDER_BLUEPRINT_ARTWORK_PRESETS = {
	'bring-the-firm': {
		backColor: '#9DE5F3',
		frontColor: '#DFA0F4',
		icon: UsersRound,
		iconCenterX: '60%',
		iconCenterY: '46%'
	},
	'whitespace-finder': {
		backColor: '#FFA0A1',
		frontColor: '#DDFB93',
		icon: ScanSearch,
		iconCenterX: '60%',
		iconCenterY: '46%'
	},
	'reasons-to-connect': {
		backColor: '#DDFB93',
		frontColor: '#FFA0A1',
		icon: BellRing,
		iconCenterX: '60%',
		iconCenterY: '46%'
	},
	'cross-selling': {
		backColor: '#9DE5F3',
		frontColor: '#DFA0F4',
		icon: Network,
		iconCenterX: '60%',
		iconCenterY: '46%'
	},
	'custom-notification': {
		backColor: '#DDFB93',
		frontColor: '#9DE5F3',
		icon: Sparkles,
		iconCenterX: '60%',
		iconCenterY: '46%'
	}
} satisfies Record<BuilderCardId, BuilderBlueprintArtworkPreset>;

export function getBuilderBlueprintArtworkPreset(cardId: string) {
	if (cardId in BUILDER_BLUEPRINT_ARTWORK_PRESETS) {
		return BUILDER_BLUEPRINT_ARTWORK_PRESETS[cardId as BuilderCardId];
	}

	return DEFAULT_BLUEPRINT_ARTWORK_PRESET;
}
