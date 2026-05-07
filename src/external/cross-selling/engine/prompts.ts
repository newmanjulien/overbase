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

export function buildCrossSellingRefinementSystemPrompt() {
	return joinPromptLines([
		...CROSS_SELLING_REFINEMENT_RULES,
		EXECUTIVE_WRITING_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}
