import FlagIcon from 'phosphor-svelte/lib/FlagIcon';
import QuotesIcon from 'phosphor-svelte/lib/QuotesIcon';
import type { PhosphorIcon } from '$lib/ui/icons';

export type BlueprintArtworkCardTone = 'coral' | 'violet' | 'aqua' | 'stone';
export type BlueprintArtworkCardSymbolSize = 'sm' | 'md';

export type BlueprintArtwork = {
	id: string;
	card: {
		tone: BlueprintArtworkCardTone;
		iconId: string;
		symbolSize: BlueprintArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconId: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

export type BlueprintArtworkPreset = {
	id: string;
	card: {
		tone: BlueprintArtworkCardTone;
		iconId: string;
		icon: PhosphorIcon;
		symbolSize: BlueprintArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconId: string;
		icon: PhosphorIcon;
		iconCenterX: string;
		iconCenterY: string;
	};
};

const BLUEPRINT_ARTWORK_ICONS: Record<string, PhosphorIcon> = {
	'message-square-quote': QuotesIcon
};

function getBlueprintArtworkIcon(iconId: string) {
	return BLUEPRINT_ARTWORK_ICONS[iconId] ?? FlagIcon;
}

export function toBlueprintArtworkPreset(artwork: BlueprintArtwork): BlueprintArtworkPreset {
	return {
		id: artwork.id,
		card: {
			tone: artwork.card.tone,
			iconId: artwork.card.iconId,
			icon: getBlueprintArtworkIcon(artwork.card.iconId),
			symbolSize: artwork.card.symbolSize
		},
		panel: {
			backColor: artwork.panel.backColor,
			frontColor: artwork.panel.frontColor,
			iconId: artwork.panel.iconId,
			icon: getBlueprintArtworkIcon(artwork.panel.iconId),
			iconCenterX: artwork.panel.iconCenterX,
			iconCenterY: artwork.panel.iconCenterY
		}
	};
}
