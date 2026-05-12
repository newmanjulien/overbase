export type OnboardingStep =
	| 'businessForm'
	| 'researchingBusiness'
	| 'reviewBusiness'
	| 'researchingGoToMarket'
	| 'reviewGoToMarket'
	| 'recommendingBlueprints'
	| 'blueprintRecommendations';

export type OnboardingBlueprintRecommendation = {
	appSlug: string;
	title: string;
	description: string;
	reason: string;
	artwork: {
		id: string;
		card: {
			tone: 'coral' | 'violet' | 'aqua' | 'zinc';
			iconId: string;
			symbolSize: 'sm' | 'md';
		};
	};
};
