import FlagIcon from 'phosphor-svelte/lib/FlagIcon';
import QuotesIcon from 'phosphor-svelte/lib/QuotesIcon';
import type { PhosphorIcon } from '$lib/ui/icons';

export type BuilderArtworkCardTone = 'coral' | 'violet' | 'aqua' | 'stone';
export type BuilderArtworkCardSymbolSize = 'sm' | 'md';

export type BuilderArtwork = {
	id: string;
	card: {
		tone: BuilderArtworkCardTone;
		iconId: string;
		symbolSize: BuilderArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconId: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

export type BuilderArtworkPreset = {
	id: string;
	card: {
		tone: BuilderArtworkCardTone;
		iconId: string;
		icon: PhosphorIcon;
		symbolSize: BuilderArtworkCardSymbolSize;
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

const BUILDER_ARTWORK_ICONS: Record<string, PhosphorIcon> = {
	'message-square-quote': QuotesIcon
};

function getBuilderArtworkIcon(iconId: string) {
	return BUILDER_ARTWORK_ICONS[iconId] ?? FlagIcon;
}

export function toBuilderArtworkPreset(artwork: BuilderArtwork): BuilderArtworkPreset {
	return {
		id: artwork.id,
		card: {
			tone: artwork.card.tone,
			iconId: artwork.card.iconId,
			icon: getBuilderArtworkIcon(artwork.card.iconId),
			symbolSize: artwork.card.symbolSize
		},
		panel: {
			backColor: artwork.panel.backColor,
			frontColor: artwork.panel.frontColor,
			iconId: artwork.panel.iconId,
			icon: getBuilderArtworkIcon(artwork.panel.iconId),
			iconCenterX: artwork.panel.iconCenterX,
			iconCenterY: artwork.panel.iconCenterY
		}
	};
}
