import {
	createGuidedEmailInitialDraft,
	streamGuidedEmailRefinementTurn
} from '../../shared/guided-email-workflow';
import type { WhitespaceFinderInitialDraftParams, WhitespaceFinderRefinementParams } from './types';
import {
	buildWhitespaceFinderInitialDraftPrompt,
	buildWhitespaceFinderRefinementSystemPrompt
} from './prompts';

export async function createWhitespaceFinderInitialDraft(params: WhitespaceFinderInitialDraftParams) {
	return await createGuidedEmailInitialDraft({
		prompt: buildWhitespaceFinderInitialDraftPrompt(params),
		toolName: 'whitespace_finder_create_email_draft',
		toolDescription: 'Create the Whitespace finder email notification draft.'
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
