export type OnboardingStep = 'welcome' | 'signup' | 'company' | 'partner' | 'blueprint';

export type OnboardingQuote = {
	text: string;
	personName: string;
	personTitle: string;
	avatarSrc: string;
	avatarAlt: string;
};

export type OnboardingCompany = {
	name: string;
	website: string;
};

export type OnboardingPartner = {
	name: string;
	collaboration: string;
};

export type OnboardingBlueprintsResponse = {
	blueprints: import('../../../builder-apps/registry').BuilderAppRegistryEntry[];
};
