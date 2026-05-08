import type { EmailDraft } from '@overbase/builder-sdk/email';
import {
	buildGuidedEmailInitialAnswerPrompt,
	buildGuidedEmailInitialQuestionPrompt
} from '../../shared/guided-email-workflow';
import { whitespaceFinderExamples } from '../examples';
import {
	whitespaceFinderGuide,
	WHITESPACE_FINDER_DRAFT_RULES,
	WHITESPACE_FINDER_REFINEMENT_RULES,
	EXAMPLE_FIDELITY_RULES,
	EXECUTIVE_WRITING_RULES
} from '../rules';

function stringifyPromptData(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function joinPromptLines(lines: readonly string[]) {
	return lines.join('\n');
}

export function buildWhitespaceFinderInitialDraftPrompt(params: { initialMessage: string }) {
	return {
		systemPrompt: joinPromptLines([
			...WHITESPACE_FINDER_DRAFT_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES
		]),
		userPrompt: [
			'Builder app: Whitespace finder',
			'Guided questions:',
			stringifyPromptData(whitespaceFinderGuide.questions),
			'User answers:',
			params.initialMessage,
			'Example email drafts:',
			stringifyPromptData(whitespaceFinderExamples)
		].join('\n\n')
	};
}

export function buildWhitespaceFinderInitialQuestionPrompt(params: { initialMessage: string }) {
	return buildGuidedEmailInitialQuestionPrompt({
		appTitle: 'Whitespace finder',
		initialMessage: params.initialMessage,
		guideQuestions: whitespaceFinderGuide.questions
	});
}

export function buildWhitespaceFinderInitialAnswerPrompt(params: {
	initialMessage: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
}) {
	return buildGuidedEmailInitialAnswerPrompt({
		appTitle: 'Whitespace finder',
		initialMessage: params.initialMessage,
		initialQuestion: params.initialQuestion,
		initialAnswer: params.initialAnswer,
		draft: params.draft,
		guideQuestions: whitespaceFinderGuide.questions,
		draftRules: [
			...WHITESPACE_FINDER_DRAFT_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES
		]
	});
}

export function buildWhitespaceFinderRefinementSystemPrompt() {
	return joinPromptLines([
		...WHITESPACE_FINDER_REFINEMENT_RULES,
		EXECUTIVE_WRITING_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}
