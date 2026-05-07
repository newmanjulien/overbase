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

export function buildWhitespaceFinderRefinementSystemPrompt() {
	return joinPromptLines([
		...WHITESPACE_FINDER_REFINEMENT_RULES,
		EXECUTIVE_WRITING_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}
