import {
	applyGuidedEmailInitialAnswer,
	createGuidedEmailInitialDraft,
	streamGuidedEmailInitialQuestion,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type {
	ReasonsToConnectInitialAnswerParams,
	ReasonsToConnectInitialDraftParams,
	ReasonsToConnectInitialQuestionParams,
	ReasonsToConnectRefinementParams
} from './types';
import {
	buildReasonsToConnectInitialAnswerPrompt,
	buildReasonsToConnectInitialDraftPrompt,
	buildReasonsToConnectInitialQuestionPrompt,
	buildReasonsToConnectRefinementSystemPrompt
} from './prompts';

export async function createReasonsToConnectInitialQuestion(
	params: ReasonsToConnectInitialQuestionParams
) {
	return await streamGuidedEmailInitialQuestion({
		prompt: buildReasonsToConnectInitialQuestionPrompt(params),
		handlers: {
			onDelta: async (delta) => {
				await params.handlers.onAssistantDelta?.(delta);
			}
		}
	});
}

export async function createReasonsToConnectInitialDraft(params: ReasonsToConnectInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildReasonsToConnectInitialDraftPrompt(params),
		toolName: 'reasons_to_connect_create_email_draft',
		toolDescription: 'Create the Reasons to connect email notification draft.'
	});
}

export async function applyReasonsToConnectInitialAnswer(
	params: ReasonsToConnectInitialAnswerParams
) {
	return await applyGuidedEmailInitialAnswer({
		prompt: buildReasonsToConnectInitialAnswerPrompt(params),
		toolDescription:
			'Return the Reasons to connect email notification draft after applying the first answer.'
	});
}

export async function streamReasonsToConnectRefinementTurn(params: ReasonsToConnectRefinementParams) {
	return await streamGuidedEmailRefinementTurn({
		systemPrompt: buildReasonsToConnectRefinementSystemPrompt(),
		draft: params.draft,
		recentEvents: params.recentEvents,
		transcript: params.transcript,
		handlers: params.handlers
	});
}
