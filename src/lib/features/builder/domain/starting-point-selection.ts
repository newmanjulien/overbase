import type { InlineTextContent } from '$lib/domain/inline-text';

export const BUILDER_STARTING_POINT_SELECTION_SKIPPED_ANSWER = '__skipped__';

export type BuilderStartingPointSelectionOption = {
	id: string;
	label: string;
};

export type BuilderStartingPointSelectionQuestion = {
	id: string;
	title: string;
	helpText?: string;
	options: readonly BuilderStartingPointSelectionOption[];
};

export type BuilderStartingPointSelectionAnswers = Record<string, string>;

export type BuilderStartingPointSelectionRule = {
	id: string;
	startingPointId: string;
	answers: Partial<BuilderStartingPointSelectionAnswers>;
};

export type GuidedStartingPointSelection = {
	kind: 'guided';
	intro: string;
	infoBar?: {
		label: string;
		content: InlineTextContent;
	};
	questions: readonly BuilderStartingPointSelectionQuestion[];
	rules: readonly BuilderStartingPointSelectionRule[];
};

export type FixedStartingPointSelection = {
	kind: 'fixed-starting-point';
	startingPointId: string;
};

export type BuilderStartingPointSelection =
	| GuidedStartingPointSelection
	| FixedStartingPointSelection;
