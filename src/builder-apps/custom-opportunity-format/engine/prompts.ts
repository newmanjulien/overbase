import type { EmailDraft } from '@overbase/builder-sdk/email';
import {
	CUSTOM_EMAIL_EXAMPLE_ADAPTATION_OPENING_RULES,
	CUSTOM_EMAIL_HIDDEN_DRAFT_RULES,
	CUSTOM_EMAIL_INITIAL_ANSWER_OPENING_RULES,
	CUSTOM_EMAIL_REFINEMENT_CHAT_RULES,
	CUSTOM_EMAIL_REFINEMENT_DRAFT_RULES,
	CUSTOM_EMAIL_ROUTING_RULES,
	EXAMPLE_FIDELITY_RULES,
	EXECUTIVE_WRITING_RULES
} from '../rules';
import type { CustomEmailAiContext, EmailExampleCandidate, EmailExamplesCandidate } from '../types';

const CUSTOM_EMAIL_AI_CONTEXT_RULE =
	'Use Builder/user context to interpret the builder user, intent, audience, and format use. Do not treat it as literal email copy unless the user asks.';

function stringifyPromptData(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function joinPromptLines(lines: readonly string[]) {
	return lines.join('\n');
}

export function formatCustomEmailAiContextPromptBlock(aiContext?: CustomEmailAiContext) {
	const contextEntries = [
		['Person context', aiContext?.personContext],
		['Conversation reason', aiContext?.conversationReason],
		['Format use', aiContext?.formatUse]
	].filter((entry): entry is [string, string] => Boolean(entry[1]));

	if (contextEntries.length === 0) {
		return '';
	}

	return [
		'Builder/user context:',
		...contextEntries.map(([label, value]) => `${label}: ${value}`)
	].join('\n');
}

function withAiContextBlock(lines: string[], aiContext?: CustomEmailAiContext) {
	const aiContextBlock = formatCustomEmailAiContextPromptBlock(aiContext);

	if (!aiContextBlock) {
		return lines;
	}

	return [lines[0] ?? '', lines[1] ?? '', aiContextBlock, ...lines.slice(2)].filter(Boolean);
}

export function buildEmailRoutingPrompt(params: {
	setupPromptText: string;
	examples: EmailExamplesCandidate[];
	aiContext?: CustomEmailAiContext;
}) {
	return {
		systemPrompt: joinPromptLines([
			...CUSTOM_EMAIL_ROUTING_RULES,
			CUSTOM_EMAIL_AI_CONTEXT_RULE
		]),
		userPrompt: withAiContextBlock(
			[
				'Run setup:',
				params.setupPromptText,
				'Available examples:',
				stringifyPromptData(params.examples)
			],
			params.aiContext
		).join('\n\n')
	};
}

export function buildEmailExampleAdaptationPrompt(params: {
	setupPromptText: string;
	examples: EmailExamplesCandidate;
	draftExamples: EmailExampleCandidate[];
	aiContext?: CustomEmailAiContext;
}) {
	return {
		systemPrompt: joinPromptLines([
			...CUSTOM_EMAIL_EXAMPLE_ADAPTATION_OPENING_RULES,
			CUSTOM_EMAIL_AI_CONTEXT_RULE,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES,
			...CUSTOM_EMAIL_HIDDEN_DRAFT_RULES
		]),
		userPrompt: withAiContextBlock(
			[
				'Run setup:',
				params.setupPromptText,
				'Selected examples:',
				stringifyPromptData(params.examples),
				'Candidate email examples:',
				stringifyPromptData(params.draftExamples)
			],
			params.aiContext
		).join('\n\n')
	};
}

export function buildEmailInitialAnswerPrompt(params: {
	setupPromptText: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
	aiContext?: CustomEmailAiContext;
}) {
	return {
		systemPrompt: joinPromptLines([
			...CUSTOM_EMAIL_INITIAL_ANSWER_OPENING_RULES,
			CUSTOM_EMAIL_AI_CONTEXT_RULE,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES,
			...CUSTOM_EMAIL_HIDDEN_DRAFT_RULES
		]),
		userPrompt: withAiContextBlock(
			[
				'Run setup:',
				params.setupPromptText,
				'Follow-up question:',
				params.initialQuestion,
				'User answer:',
				params.initialAnswer,
				'Hidden draft JSON:',
				stringifyPromptData(params.draft)
			],
			params.aiContext
		).join('\n\n')
	};
}

export function buildEmailRefinementSystemPrompt() {
	return joinPromptLines([
		...CUSTOM_EMAIL_REFINEMENT_CHAT_RULES,
		CUSTOM_EMAIL_AI_CONTEXT_RULE,
		EXECUTIVE_WRITING_RULES,
		...CUSTOM_EMAIL_REFINEMENT_DRAFT_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}

export function buildEmailRefinementUserPrompt(params: {
	draft: EmailDraft;
	aiContext?: CustomEmailAiContext;
}) {
	const aiContextBlock = formatCustomEmailAiContextPromptBlock(params.aiContext);

	return [
		...(aiContextBlock ? [aiContextBlock, ''] : []),
		'Current visible email draft JSON:',
		JSON.stringify(params.draft),
		'Respond to the user in normal text. If the draft should change, call update_email_draft.'
	].join('\n');
}
