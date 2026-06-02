export const FORMAT_STARTER_ARTWORK_ICON_IDS = [
	'clipboard-text',
	'gavel',
	'handshake',
	'linkedin-logo',
	'trend-up'
] as const;
export type FormatStarterArtworkIconId = (typeof FORMAT_STARTER_ARTWORK_ICON_IDS)[number];

export type FormatStarterArtwork = {
	id: string;
	iconId: FormatStarterArtworkIconId;
	panel: {
		backColor: string;
		frontColor: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

export function isFormatStarterArtworkIconId(iconId: string): iconId is FormatStarterArtworkIconId {
	return FORMAT_STARTER_ARTWORK_ICON_IDS.includes(iconId as FormatStarterArtworkIconId);
}
