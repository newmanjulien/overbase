import { bringTheFirmExamples } from '../examples';
import {
	bringTheFirmGuide,
	BRING_THE_FIRM_DRAFT_RULES,
	BRING_THE_FIRM_REFINEMENT_RULES,
	EXAMPLE_FIDELITY_RULES,
	EXECUTIVE_WRITING_RULES
} from '../rules';

function stringifyPromptData(value: unknown) {
	return JSON.stringify(value, null, 2);
}

function joinPromptLines(lines: readonly string[]) {
	return lines.join('\n');
}

export function buildBringTheFirmInitialDraftPrompt(params: { initialMessage: string }) {
	return {
		systemPrompt: joinPromptLines([
			...BRING_THE_FIRM_DRAFT_RULES,
			EXECUTIVE_WRITING_RULES,
			EXAMPLE_FIDELITY_RULES
		]),
		userPrompt: [
			'Builder app: Bring the firm',
			'Guided questions:',
			stringifyPromptData(bringTheFirmGuide.questions),
			'User answers:',
			params.initialMessage,
			'Example email drafts:',
			stringifyPromptData(bringTheFirmExamples)
		].join('\n\n')
	};
}

export function buildBringTheFirmRefinementSystemPrompt() {
	return joinPromptLines([
		...BRING_THE_FIRM_REFINEMENT_RULES,
		EXECUTIVE_WRITING_RULES,
		EXAMPLE_FIDELITY_RULES
	]);
}
