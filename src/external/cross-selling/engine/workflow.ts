import {
	createGuidedEmailInitialDraft,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type { CrossSellingInitialDraftParams, CrossSellingRefinementParams } from './types';
import {
	buildCrossSellingInitialDraftPrompt,
	buildCrossSellingRefinementSystemPrompt
} from './prompts';

export async function createCrossSellingInitialDraft(params: CrossSellingInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildCrossSellingInitialDraftPrompt(params),
		toolName: 'cross_selling_create_email_draft',
		toolDescription: 'Create the Cross-selling email notification draft.'
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
