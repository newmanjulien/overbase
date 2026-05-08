import {
	createGuidedEmailInitialDraft,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type { ReasonsToConnectInitialDraftParams, ReasonsToConnectRefinementParams } from './types';
import {
	buildReasonsToConnectInitialDraftPrompt,
	buildReasonsToConnectRefinementSystemPrompt
} from './prompts';

export async function createReasonsToConnectInitialDraft(params: ReasonsToConnectInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildReasonsToConnectInitialDraftPrompt(params),
		toolName: 'reasons_to_connect_create_email_draft',
		toolDescription: 'Create the Reasons to connect email notification draft.'
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
