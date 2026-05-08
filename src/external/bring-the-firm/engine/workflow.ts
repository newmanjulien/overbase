import {
	createGuidedEmailInitialDraft,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type { BringTheFirmInitialDraftParams, BringTheFirmRefinementParams } from './types';
import {
	buildBringTheFirmInitialDraftPrompt,
	buildBringTheFirmRefinementSystemPrompt
} from './prompts';

export async function createBringTheFirmInitialDraft(params: BringTheFirmInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildBringTheFirmInitialDraftPrompt(params),
		toolName: 'bring_the_firm_create_email_draft',
		toolDescription: 'Create the Bring the firm email notification draft.'
	});
}

export async function streamBringTheFirmRefinementTurn(params: BringTheFirmRefinementParams) {
	return await streamGuidedEmailRefinementTurn({
		systemPrompt: buildBringTheFirmRefinementSystemPrompt(),
		draft: params.draft,
		recentEvents: params.recentEvents,
		transcript: params.transcript,
		handlers: params.handlers
	});
}
