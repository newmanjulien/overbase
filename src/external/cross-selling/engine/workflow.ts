import {
	applyGuidedEmailInitialAnswer,
	createGuidedEmailInitialDraft,
	streamGuidedEmailInitialQuestion,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type {
	CrossSellingInitialAnswerParams,
	CrossSellingInitialDraftParams,
	CrossSellingInitialQuestionParams,
	CrossSellingRefinementParams
} from './types';
import {
	buildCrossSellingInitialAnswerPrompt,
	buildCrossSellingInitialDraftPrompt,
	buildCrossSellingInitialQuestionPrompt,
	buildCrossSellingRefinementSystemPrompt
} from './prompts';

export async function createCrossSellingInitialQuestion(params: CrossSellingInitialQuestionParams) {
	return await streamGuidedEmailInitialQuestion({
		prompt: buildCrossSellingInitialQuestionPrompt(params),
		handlers: {
			onDelta: async (delta) => {
				await params.handlers.onAssistantDelta?.(delta);
			}
		}
	});
}

export async function createCrossSellingInitialDraft(params: CrossSellingInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildCrossSellingInitialDraftPrompt(params),
		toolName: 'cross_selling_create_email_draft',
		toolDescription: 'Create the Cross-selling email notification draft.'
	});
}

export async function applyCrossSellingInitialAnswer(params: CrossSellingInitialAnswerParams) {
	return await applyGuidedEmailInitialAnswer({
		prompt: buildCrossSellingInitialAnswerPrompt(params),
		toolDescription: 'Return the Cross-selling email notification draft after applying the first answer.'
	});
}

export async function streamCrossSellingRefinementTurn(params: CrossSellingRefinementParams) {
	return await streamGuidedEmailRefinementTurn({
		systemPrompt: buildCrossSellingRefinementSystemPrompt(),
		draft: params.draft,
		recentEvents: params.recentEvents,
		transcript: params.transcript,
		handlers: params.handlers
	});
}
