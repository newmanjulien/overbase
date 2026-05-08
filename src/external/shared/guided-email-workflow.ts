import {
	applyEmailDraftPatch,
	emailDraftJsonSchema,
	emailDraftPatchJsonSchema,
	normalizeEmailDraft,
	type EmailDraft
} from '@overbase/builder-sdk/email';
import type { InitialDraftParams, RefinementParams } from '@overbase/builder-sdk/app-protocol';
import {
	callStructuredTool,
	getOpenAIConfig,
	getOpenAIErrorMessage,
	getOpenAIHeaders,
	OPENAI_RESPONSES_URL,
	STRUCTURED_MAX_OUTPUT_TOKENS,
	supportsReasoningOptions
} from '@overbase/builder-sdk/openai';
import {
	readEmailBuilderTurnStream,
	type EmailBuilderTurnStreamResult
} from '@overbase/builder-sdk/streams';

const UPDATE_EMAIL_DRAFT_TOOL_NAME = 'update_email_draft';

type InitialDraftPrompt = {
	systemPrompt: string;
	userPrompt: string;
};

type GuidedRefinementParams = Pick<
	RefinementParams,
	'draft' | 'recentEvents' | 'transcript' | 'handlers'
>;

export async function createGuidedEmailInitialDraft(params: {
	prompt: InitialDraftPrompt;
	toolName: string;
	toolDescription: string;
}) {
	const result = await callStructuredTool<{ emailDraft: EmailDraft }>({
		systemPrompt: params.prompt.systemPrompt,
		userPrompt: params.prompt.userPrompt,
		toolName: params.toolName,
		toolDescription: params.toolDescription,
		toolParameters: {
			type: 'object',
			additionalProperties: false,
			properties: {
				emailDraft: emailDraftJsonSchema
			},
			required: ['emailDraft']
		}
	});

	return normalizeEmailDraft(result.emailDraft);
}

function buildRefinementUserPrompt(params: {
	draft: EmailDraft;
	recentEvents: RefinementParams['recentEvents'];
}) {
	return [
		'Current visible email draft JSON:',
		JSON.stringify(params.draft),
		params.recentEvents.length > 0
			? ['Recent email draft events:', JSON.stringify(params.recentEvents)].join('\n')
			: 'Recent email draft events: []',
		'Respond to the user in normal text. If the draft should change, call update_email_draft.'
	].join('\n');
}

export async function streamGuidedEmailRefinementTurn(
	params: {
		systemPrompt: string;
	} & GuidedRefinementParams
): Promise<EmailBuilderTurnStreamResult> {
	const { apiKey, model, reasoningEffort } = getOpenAIConfig();
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: params.systemPrompt
				},
				...params.transcript.map((message) => ({
					role: message.role,
					content: message.text
				})),
				{
					role: 'user',
					content: buildRefinementUserPrompt({
						draft: params.draft,
						recentEvents: params.recentEvents
					})
				}
			],
			tools: [
				{
					type: 'function',
					name: UPDATE_EMAIL_DRAFT_TOOL_NAME,
					description: 'Patch the visible email notification draft.',
					parameters: emailDraftPatchJsonSchema,
					strict: true
				}
			],
			parallel_tool_calls: false,
			...(supportsReasoningOptions(model) ? { reasoning: { effort: reasoningEffort } } : {}),
			max_output_tokens: STRUCTURED_MAX_OUTPUT_TOKENS,
			store: false,
			stream: true
		})
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	const result = await readEmailBuilderTurnStream(response, params.handlers);
	const normalizedDraft = normalizeEmailDraft(params.draft);
	const meaningfulOperations =
		result.patch?.operations.filter((operation) => {
			const nextDraft = applyEmailDraftPatch(params.draft, { operations: [operation] });
			return JSON.stringify(nextDraft) !== JSON.stringify(normalizedDraft);
		}) ?? null;
	const patchIntent = result.patch
		? meaningfulOperations && meaningfulOperations.length > 0
			? 'meaningful'
			: 'noop'
		: 'none';

	return {
		...result,
		patch:
			patchIntent === 'meaningful' && meaningfulOperations
				? {
						operations: meaningfulOperations
					}
				: null,
		patchIntent
	};
}

export type { InitialDraftParams, RefinementParams };
