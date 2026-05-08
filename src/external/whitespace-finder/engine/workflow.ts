import {
	applyGuidedEmailInitialAnswer,
	createGuidedEmailInitialDraft,
	streamGuidedEmailInitialQuestion,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type {
	WhitespaceFinderInitialAnswerParams,
	WhitespaceFinderInitialDraftParams,
	WhitespaceFinderInitialQuestionParams,
	WhitespaceFinderRefinementParams
} from './types';
import {
	buildWhitespaceFinderInitialAnswerPrompt,
	buildWhitespaceFinderInitialDraftPrompt,
	buildWhitespaceFinderInitialQuestionPrompt,
	buildWhitespaceFinderRefinementSystemPrompt
} from './prompts';

export async function createWhitespaceFinderInitialQuestion(
	params: WhitespaceFinderInitialQuestionParams
) {
	return await streamGuidedEmailInitialQuestion({
		prompt: buildWhitespaceFinderInitialQuestionPrompt(params),
		handlers: {
			onDelta: async (delta) => {
				await params.handlers.onAssistantDelta?.(delta);
			}
		}
	});
}

export async function createWhitespaceFinderInitialDraft(params: WhitespaceFinderInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildWhitespaceFinderInitialDraftPrompt(params),
		toolName: 'whitespace_finder_create_email_draft',
		toolDescription: 'Create the Whitespace finder email notification draft.'
	});
}

export async function applyWhitespaceFinderInitialAnswer(params: WhitespaceFinderInitialAnswerParams) {
	return await applyGuidedEmailInitialAnswer({
		prompt: buildWhitespaceFinderInitialAnswerPrompt(params),
		toolDescription: 'Return the Whitespace finder email notification draft after applying the first answer.'
	});
}

export async function streamWhitespaceFinderRefinementTurn(params: WhitespaceFinderRefinementParams) {
	return await streamGuidedEmailRefinementTurn({
		systemPrompt: buildWhitespaceFinderRefinementSystemPrompt(),
		draft: params.draft,
		recentEvents: params.recentEvents,
		transcript: params.transcript,
		handlers: params.handlers
	});
}
