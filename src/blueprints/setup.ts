export const BLUEPRINT_SETUP_SKIPPED_ANSWER = '__skipped__';

export type BlueprintSetupOption = {
	id: string;
	label: string;
};

export type BlueprintSetupQuestion = {
	id: string;
	title: string;
	helpText?: string;
	options: readonly BlueprintSetupOption[];
};

export type BlueprintSetup = {
	intro: string;
	questions: readonly BlueprintSetupQuestion[];
};

export type BlueprintSetupAnswers = Record<string, string>;
