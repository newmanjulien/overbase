import { reasonsToConnectExamples } from '../examples';
import {
	reasonsToConnectGuide,
	REASONS_TO_CONNECT_DRAFT_RULES,
	REASONS_TO_CONNECT_REFINEMENT_RULES,
	EXAMPLE_FIDELITY_RULES,
	EXECUTIVE_WRITING_RULES
} from '../rules';

function stringifyPromptData(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function joinPromptLines(lines: readonly string[]) {
	return lines.join('\n');
}

export function buildReasonsToConnectInitialDraftPrompt(params: { initialMessage: string }) {
	return {
		systemPrompt: joinPromptLines([
			...REASONS_TO_CONNECT_DRAFT_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES
		]),
		userPrompt: [
			'Builder app: Reasons to connect',
			'Guided questions:',
			stringifyPromptData(reasonsToConnectGuide.questions),
			'User answers:',
			params.initialMessage,
			'Example email drafts:',
			stringifyPromptData(reasonsToConnectExamples)
		].join('\n\n')
	};
}

export function buildReasonsToConnectRefinementSystemPrompt() {
	return joinPromptLines([
		...REASONS_TO_CONNECT_REFINEMENT_RULES,
		EXECUTIVE_WRITING_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}
