export type BuilderGuideChoiceQuestion = {
	id: string;
	type: 'choice';
	title: string;
	options: readonly string[];
	customAnswerPlaceholder: string;
};

export type BuilderGuideTextQuestion = {
	id: string;
	type: 'text';
	title: string;
	placeholder: string;
};

export type BuilderGuideQuestion = BuilderGuideChoiceQuestion | BuilderGuideTextQuestion;

export type BuilderGuideDefinition = {
	intro: string;
	questions: readonly BuilderGuideQuestion[];
};
