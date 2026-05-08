import { BRING_THE_FIRM_APP_SLUG, CUSTOM_NOTIFICATION_APP_SLUG } from './ids';

export type AppStatus = 'active';

export type ArtworkCardTone = 'coral' | 'violet' | 'aqua' | 'zinc';
export type ArtworkCardSymbolSize = 'sm' | 'md';

export type BuilderAppArtwork = {
	id: string;
	card: {
		tone: ArtworkCardTone;
		iconId: string;
		symbolSize: ArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconId: string;
		iconCenterX: string;
		iconCenterY: string;
	};
};

export type BuilderAppPresentation = {
	slug: string;
	categoryIds: readonly string[];
	artwork: BuilderAppArtwork;
	showInGallery: boolean;
	sortOrder: number;
	status: AppStatus;
};

export const builderAppPresentationEntries = [
	{
		slug: BRING_THE_FIRM_APP_SLUG,
		categoryIds: ['consulting', 'law'],
		artwork: {
			id: 'team-violet',
			card: {
				tone: 'violet',
				iconId: 'users-round',
				symbolSize: 'md'
			},
			panel: {
				backColor: '#9DE5F3',
				frontColor: '#DFA0F4',
				iconId: 'users-round',
				iconCenterX: '60%',
				iconCenterY: '46%'
			}
		},
		showInGallery: true,
		sortOrder: 10,
		status: 'active'
	},
	{
		slug: CUSTOM_NOTIFICATION_APP_SLUG,
		categoryIds: [],
		artwork: {
			id: 'spark-coral',
			card: {
				tone: 'coral',
				iconId: 'sparkles',
				symbolSize: 'md'
			},
			panel: {
				backColor: '#DDFB93',
				frontColor: '#9DE5F3',
				iconId: 'sparkles',
				iconCenterX: '60%',
				iconCenterY: '46%'
			}
		},
		showInGallery: false,
		sortOrder: 50,
		status: 'active'
	}
] satisfies BuilderAppPresentation[];
