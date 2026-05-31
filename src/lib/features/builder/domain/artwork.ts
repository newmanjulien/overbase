export type BuilderArtworkCardTone = 'coral' | 'violet' | 'aqua' | 'mint' | 'blush' | 'stone';
export type BuilderArtworkCardSymbolSize = 'sm' | 'md';
export const BUILDER_ARTWORK_ICON_IDS = [
	'clipboard-text',
	'gavel',
	'handshake',
	'linkedin-logo',
	'trend-up'
] as const;
export type BuilderArtworkIconId = (typeof BUILDER_ARTWORK_ICON_IDS)[number];

export type BuilderArtwork = {
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

export function isBuilderArtworkIconId(iconId: string): iconId is BuilderArtworkIconId {
	return BUILDER_ARTWORK_ICON_IDS.includes(iconId as BuilderArtworkIconId);
}
