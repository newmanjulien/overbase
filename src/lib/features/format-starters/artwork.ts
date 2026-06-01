import type {
	FormatStarterArtwork,
	FormatStarterArtworkCardSymbolSize,
	FormatStarterArtworkCardTone,
	FormatStarterArtworkIconId
} from '$lib/features/format-starters/domain';

export type {
	FormatStarterArtwork,
	FormatStarterArtworkCardSymbolSize,
	FormatStarterArtworkCardTone,
	FormatStarterArtworkIconId
} from '$lib/features/format-starters/domain';

export type FormatStarterArtworkPreset = {
	id: string;
	iconId: FormatStarterArtworkIconId;
	card: {
		tone: FormatStarterArtworkCardTone;
		symbolSize: FormatStarterArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

export function toFormatStarterArtworkPreset(artwork: FormatStarterArtwork): FormatStarterArtworkPreset {
	return {
		id: artwork.id,
		iconId: artwork.iconId,
		card: {
			tone: artwork.card.tone,
			symbolSize: artwork.card.symbolSize
		},
		panel: {
			backColor: artwork.panel.backColor,
			frontColor: artwork.panel.frontColor,
			iconCenterX: artwork.panel.iconCenterX,
			iconCenterY: artwork.panel.iconCenterY
		}
	};
}
