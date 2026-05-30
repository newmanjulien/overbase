export type BuilderStatus = 'active';

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

export type BuilderPresentation = {
	slug: string;
	categoryIds: readonly string[];
	artwork: BuilderArtwork;
	showInGallery: boolean;
	sortOrder: number;
	status: BuilderStatus;
};
