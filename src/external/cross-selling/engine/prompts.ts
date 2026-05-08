import type { EmailDraft } from '@overbase/builder-sdk/email';
import {
	buildGuidedEmailInitialAnswerPrompt,
	buildGuidedEmailInitialQuestionPrompt
} from '../../shared/guided-email-workflow';
import { crossSellingExamples } from '../examples';
import {
	crossSellingGuide,
	CROSS_SELLING_DRAFT_RULES,
	CROSS_SELLING_REFINEMENT_RULES,
	EXAMPLE_FIDELITY_RULES,
	EXECUTIVE_WRITING_RULES
} from '../rules';

function stringifyPromptData(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function joinPromptLines(lines: readonly string[]) {
	return lines.join('\n');
}

export function buildCrossSellingInitialDraftPrompt(params: { initialMessage: string }) {
	return {
		systemPrompt: joinPromptLines([
			...CROSS_SELLING_DRAFT_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES
		]),
		userPrompt: [
			'Builder app: Cross-selling',
			'Guided questions:',
			stringifyPromptData(crossSellingGuide.questions),
			'User answers:',
			params.initialMessage,
			'Example email drafts:',
			stringifyPromptData(crossSellingExamples)
		].join('\n\n')
	};
}

export function buildCrossSellingInitialQuestionPrompt(params: { initialMessage: string }) {
	return buildGuidedEmailInitialQuestionPrompt({
		appTitle: 'Cross-selling',
		initialMessage: params.initialMessage,
		guideQuestions: crossSellingGuide.questions
	});
}

export function buildCrossSellingInitialAnswerPrompt(params: {
	initialMessage: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
}) {
	return buildGuidedEmailInitialAnswerPrompt({
		appTitle: 'Cross-selling',
		initialMessage: params.initialMessage,
		initialQuestion: params.initialQuestion,
		initialAnswer: params.initialAnswer,
		draft: params.draft,
		guideQuestions: crossSellingGuide.questions,
		draftRules: [
			...CROSS_SELLING_DRAFT_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES
		]
	});
}

export function buildCrossSellingRefinementSystemPrompt() {
	return joinPromptLines([
		...CROSS_SELLING_REFINEMENT_RULES,
		EXECUTIVE_WRITING_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}
