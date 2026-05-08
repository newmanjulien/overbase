import type { EmailDraft } from '@overbase/builder-sdk/email';
import {
	CUSTOM_EMAIL_EXAMPLE_ADAPTATION_DRAFT_RULES,
	CUSTOM_EMAIL_EXAMPLE_ADAPTATION_OPENING_RULES,
	CUSTOM_EMAIL_INITIAL_ANSWER_DRAFT_RULES,
	CUSTOM_EMAIL_INITIAL_ANSWER_OPENING_RULES,
	CUSTOM_EMAIL_INITIAL_QUESTION_RULES,
	CUSTOM_EMAIL_REFINEMENT_CHAT_RULES,
	CUSTOM_EMAIL_REFINEMENT_DRAFT_RULES,
	CUSTOM_EMAIL_ROUTING_RULES,
	EXAMPLE_FIDELITY_RULES,
	EXECUTIVE_WRITING_RULES
} from '../rules';
import type { EmailExampleCandidate, EmailExamplesCandidate } from '../types';

function stringifyPromptData(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function joinPromptLines(lines: readonly string[]) {
	return lines.join('\n');
}

export function buildEmailRoutingPrompt(params: {
	initialMessage: string;
	examples: EmailExamplesCandidate[];
}) {
	return {
		systemPrompt: joinPromptLines(CUSTOM_EMAIL_ROUTING_RULES),
		userPrompt: [
			'User request:',
			params.initialMessage,
			'Available examples:',
			stringifyPromptData(params.examples)
		].join('\n\n')
	};
}

export function buildEmailInitialQuestionPrompt(params: {
	initialMessage: string;
	examples: EmailExamplesCandidate;
	proposedQuestion: string;
}) {
	return {
		systemPrompt: joinPromptLines(CUSTOM_EMAIL_INITIAL_QUESTION_RULES),
		userPrompt: [
			`User request: ${params.initialMessage}`,
			`Question guidance: ${params.examples.questionGuidance}`,
			`Proposed question: ${params.proposedQuestion}`
		].join('\n')
	};
}

export function buildEmailExampleAdaptationPrompt(params: {
	initialMessage: string;
	examples: EmailExamplesCandidate;
	draftExamples: EmailExampleCandidate[];
}) {
	return {
		systemPrompt: joinPromptLines([
			...CUSTOM_EMAIL_EXAMPLE_ADAPTATION_OPENING_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES,
			...CUSTOM_EMAIL_EXAMPLE_ADAPTATION_DRAFT_RULES
		]),
		userPrompt: [
			'User request:',
			params.initialMessage,
			'Selected examples:',
			stringifyPromptData(params.examples),
			'Candidate email examples:',
			stringifyPromptData(params.draftExamples)
		].join('\n\n')
	};
}

export function buildEmailInitialAnswerPrompt(params: {
	initialMessage: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
}) {
	return {
		systemPrompt: joinPromptLines([
			...CUSTOM_EMAIL_INITIAL_ANSWER_OPENING_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES,
			...CUSTOM_EMAIL_INITIAL_ANSWER_DRAFT_RULES
		]),
		userPrompt: [
			'Original user request:',
			params.initialMessage,
			'Follow-up question:',
			params.initialQuestion,
			'User answer:',
			params.initialAnswer,
			'Hidden draft JSON:',
			stringifyPromptData(params.draft)
		].join('\n\n')
	};
}

export function buildEmailRefinementSystemPrompt() {
	return joinPromptLines([
		...CUSTOM_EMAIL_REFINEMENT_CHAT_RULES,
		EXECUTIVE_WRITING_RULES,
		...CUSTOM_EMAIL_REFINEMENT_DRAFT_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}

export function buildEmailRefinementUserPrompt(params: {
	draft: EmailDraft;
	recentEvents: unknown[];
}) {
	return [
		'Current visible email draft JSON:',
		JSON.stringify(params.draft),
		params.recentEvents.length > 0
			? ['Recent email draft events:', JSON.stringify(params.recentEvents)].join('\n')
			: 'Recent email draft events: []',
		'Respond to the user in normal text. If the draft should change, call update_email_draft.'
	].join('\n');
}
