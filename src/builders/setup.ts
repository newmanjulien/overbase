export const BUILDER_SETUP_SKIPPED_ANSWER = '__skipped__';

export type BuilderSetupOption = {
	id: string;
	label: string;
};

export type BuilderSetupQuestion = {
	id: string;
	title: string;
	helpText?: string;
	options: readonly BuilderSetupOption[];
};

export type BuilderSetup = {
	intro: string;
	questions: readonly BuilderSetupQuestion[];
};

export type BuilderSetupAnswers = Record<string, string>;
