import { BellRing, Flag, Network, ScanSearch, Sparkles, UsersRound } from 'lucide-svelte';

export type BuilderBlueprintArtworkIcon = typeof UsersRound;

export type BuilderBlueprintArtworkConfig = {
	backColor: string;
	frontColor: string;
	iconId: string;
	iconCenterX: string;
	iconCenterY: string;
};

export type BuilderBlueprintArtworkPreset = {
	backColor: string;
	frontColor: string;
	icon: BuilderBlueprintArtworkIcon;
	iconCenterX: string;
	iconCenterY: string;
};

const BLUEPRINT_ICONS: Record<string, BuilderBlueprintArtworkIcon> = {
	'bell-ring': BellRing,
	flag: Flag,
	network: Network,
	'scan-search': ScanSearch,
	sparkles: Sparkles,
	'users-round': UsersRound
};

function getBlueprintIcon(iconId: string) {
	return BLUEPRINT_ICONS[iconId] ?? UsersRound;
}

export function toBuilderBlueprintArtworkPreset(
	artwork: BuilderBlueprintArtworkConfig
): BuilderBlueprintArtworkPreset {
	return {
		backColor: artwork.backColor,
		frontColor: artwork.frontColor,
		icon: getBlueprintIcon(artwork.iconId),
		iconCenterX: artwork.iconCenterX,
		iconCenterY: artwork.iconCenterY
	};
}
