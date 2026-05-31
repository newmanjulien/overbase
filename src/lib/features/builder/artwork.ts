import type {
	BuilderArtwork,
	BuilderArtworkCardSymbolSize,
	BuilderArtworkCardTone,
	BuilderArtworkIconId
} from '$lib/features/builder/domain';

export type {
	BuilderArtwork,
	BuilderArtworkCardSymbolSize,
	BuilderArtworkCardTone,
	BuilderArtworkIconId
} from '$lib/features/builder/domain';

export type BuilderArtworkPreset = {
	id: string;
	iconId: BuilderArtworkIconId;
	card: {
		tone: BuilderArtworkCardTone;
		symbolSize: BuilderArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

export function toBuilderArtworkPreset(artwork: BuilderArtwork): BuilderArtworkPreset {
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
